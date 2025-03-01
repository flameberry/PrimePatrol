import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import 'package:geolocator/geolocator.dart'; // Added geolocator
import 'package:logger/logger.dart'; // Added logger
import 'package:flutter_dotenv/flutter_dotenv.dart';

final Logger logger = Logger();

class PostPg extends StatefulWidget {
  const PostPg({Key? key}) : super(key: key);

  @override
  _PostPgState createState() => _PostPgState();
}

class _PostPgState extends State<PostPg> {
  final TextEditingController _titleController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  String selectedCategory = 'Select Category';
  Position? _currentPosition; // Store the current position
  final TextEditingController _contentController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  // final String apiUrl = dotenv.env['API_URL'] ?? "http://192.168.1.7:3000";
  final String postApiUrl =
      dotenv.env['POST_API_URL'] ?? "http://192.168.1.7:3002";
  final String userApiUrl =
      dotenv.env['USER_API_URL'] ?? "http://192.168.1.7:3000/users";

  final List<String> _categories = [
    'Select Category',
    'Garbage Disposal',
    'Flooding',
    'Industrial Waste'
  ];
  String? firebaseUid;

  @override
  void initState() {
    super.initState();
    _getFirebaseId(); // Get current user ID when component mounts
  }

  Future<void> _getFirebaseId() async {
    User? currentUser = FirebaseAuth.instance.currentUser;
    setState(() {
      firebaseUid = currentUser?.uid;
    });
    logger.d('Current user ID: $firebaseUid'); // Replaced print with logger
  }

  Future<String?> getuserId(String firebaseUid) async {
    if (firebaseUid.isEmpty) {
      logger.e('Invalid firebase UID'); // Replaced print with logger
      return null;
    }

    logger.d('firebase Id: $firebaseUid'); // Replaced print with logger

    try {
      final response = await http.get(
        Uri.parse('$userApiUrl/firebase/$firebaseUid'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        try {
          final Map<String, dynamic> userData = json.decode(response.body);
          logger
              .d('User Data Response: $userData'); // Replaced print with logger

          return userData['_id'] as String?;
        } catch (e) {
          logger.e(
              'Error parsing JSON response: $e'); // Replaced print with logger
        }
      }
      logger.e(
          'Failed to fetch userId: ${response.statusCode}'); // Replaced print with logger
      return null;
    } catch (e) {
      logger.e('Error fetching UserId: $e'); // Replaced print with logger
      return null;
    }
  }

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  Future<void> _sendImageToQueue(File imageFile, String postId) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: '192.168.1.7', // Emulator-to-host mapping for RabbitMQ
        port: 5672,
        authProvider: PlainAuthenticator('guest', 'guest'),
      );

      Client client = Client(settings: settings);
      Channel channel = await client.channel();
      Queue queue = await channel.queue('image_queue', durable: true);

      // Convert image to Base64
      List<int> imageBytes = await imageFile.readAsBytes();
      String base64Image = base64Encode(imageBytes);

      // Create JSON payload
      String jsonMessage = jsonEncode({"image": base64Image, "postId": postId});

      // Send message
      queue.publish(jsonMessage);
      logger.d(
          '✅ Image sent to queue successfully'); // Replaced print with logger

      client.close();
    } catch (e) {
      logger.e(
          '❌ Error sending image to RabbitMQ: $e'); // Replaced print with logger
    }
  }

  // Function to get the current location
  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _errorMessage = 'Location services are disabled.';
      });
      return;
    }

    // Check location permissions
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _errorMessage = 'Location permissions are denied';
        });
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _errorMessage =
            'Location permissions are permanently denied, we cannot request permissions.';
      });
      return;
    }

    // Get the current position
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    setState(() {
      _currentPosition = position;
    });
  }

  // Function to handle post submission
  Future<void> _submitPost() async {
    logger.d('Submit Post button pressed'); // Replaced print with logger

    final String postId = Uuid().v4();

    if (_titleController.text.isEmpty || _contentController.text.isEmpty) {
      logger.e('Title or content is empty'); // Replaced print with logger
      setState(() {
        _errorMessage = 'Please fill in both title and content fields';
      });
      return;
    }

    if (_selectedImage != null) {
      logger.d('Sending image to queue'); // Replaced print with logger
      _sendImageToQueue(_selectedImage!, postId);
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      logger.d('Creating multipart request'); // Replaced print with logger
      final url = Uri.parse('$postApiUrl');
      var request = http.MultipartRequest('POST', url);
      if (firebaseUid == null) {
        setState(() {
          _errorMessage = 'Firebase ID not available';
        });
        return;
      }
      final String? userId = await getuserId(firebaseUid!);
      if (userId == null) {
        setState(() {
          _errorMessage = 'User ID could not be retrieved';
        });
        return;
      }
      logger.d('Generated Post ID: $postId'); // Replaced print with logger

      request.fields.addAll({
        'postId': postId,
        'title': _titleController.text,
        'content': _contentController.text,
        'userId': userId,
        'status': 'pending',
        'latitude': _currentPosition!.latitude.toString(),
        'longitude': _currentPosition!.longitude.toString(),
      });

      logger
          .d('Request fields: ${request.fields}'); // Replaced print with logger

      if (_selectedImage != null) {
        logger.d('Adding image to request'); // Replaced print with logger
        try {
          var imageStream = http.ByteStream(_selectedImage!.openRead());
          var length = await _selectedImage!.length();

          logger.d(
              'Image path: ${_selectedImage!.path}'); // Replaced print with logger
          logger.d('Image size: $length bytes'); // Replaced print with logger

          var multipartFile = http.MultipartFile('image', imageStream, length,
              filename: _selectedImage!.path.split('/').last);
          request.files.add(multipartFile);
        } catch (e) {
          logger.e('Failed to process image: $e'); // Replaced print with logger
          throw Exception('Failed to process image: $e');
        }
      }

      logger.d('Sending request to: $url'); // Replaced print with logger
      var streamedResponse = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          logger.e('Request timed out'); // Replaced print with logger
          throw Exception('Request timed out');
        },
      );

      // Get response
      var response = await http.Response.fromStream(streamedResponse);
      logger.d(
          'Response status: ${response.statusCode}'); // Replaced print with logger
      logger.d('Response body: ${response.body}'); // Replaced print with logger

      // Handle response
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Post created successfully!'),
              backgroundColor: Colors.green,
            ),
          );

          if (_selectedImage != null) {
            logger.d('Sending image to queue'); // Replaced print with logger
            _sendImageToQueue(_selectedImage!, postId);
          }

          // Reset form
          setState(() {
            _selectedImage = null;
            _titleController.clear();
            _contentController.clear();
            _currentPosition = null;
          });

          // Update the user's postIds array
          await _updateUserPostIds(postId);
        }
      } else {
        // Handle error response
        var errorMessage = 'Failed to create post';
        try {
          var jsonResponse = json.decode(response.body);
          errorMessage = jsonResponse['message'] ?? errorMessage;
        } catch (_) {
          // If JSON parsing fails, use status code in error message
          errorMessage = 'Server error: ${response.statusCode}';
        }
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $_errorMessage'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // Function to update the user's postIds array
  Future<void> _updateUserPostIds(String postId) async {
    if (firebaseUid == null) {
      logger.e('❌ Cannot update postIds: Firebase UID is null');
      return;
    }

    final String? userId = await getuserId(firebaseUid!);
    if (userId == null) {
      logger.e('❌ Cannot update postIds: User ID could not be retrieved');
      return;
    }

    try {
      // Log the URL we're trying to access for debugging
      final url = Uri.parse('$userApiUrl/$userId');
      logger.d('Updating user postIds at URL: $url');

      // Get the current user data first to retrieve existing postIds
      final getUserResponse = await http.get(url);

      if (getUserResponse.statusCode != 200) {
        logger.e(
            '❌ Failed to get user data: ${getUserResponse.statusCode} - ${getUserResponse.body}');
        throw Exception('Failed to get user data');
      }

      // Parse the current user data
      final userData = json.decode(getUserResponse.body);

      // Get existing postIds or create an empty list if none exist
      List<String> existingPostIds = [];
      if (userData['postIds'] != null) {
        existingPostIds = List<String>.from(userData['postIds']);
      }

      // Add the new postId if it doesn't already exist
      if (!existingPostIds.contains(postId)) {
        existingPostIds.add(postId);
      }

      // Now update the user with the combined list
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'postIds': existingPostIds,
        }),
      );

      logger.d('Update response: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        logger.d('✅ User postIds updated successfully');
      } else {
        logger.e('❌ Failed to update user postIds: ${response.body}');
        throw Exception('Failed to update user postIds');
      }
    } catch (e) {
      logger.e('❌ Error updating user postIds: $e');
      throw Exception('Error updating user postIds: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 50,
        backgroundColor: Colors.grey[50],
        title: const Text(
          'Submit a Post',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      backgroundColor: Colors.grey[50], // Light grey background
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Image Upload Section
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _pickImage,
                  icon: const Icon(Icons.upload, color: Color(0xFF2E66D7)),
                  label: const Text('Upload Image',
                      style: TextStyle(color: Color(0xFF2E66D7))),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[50],
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Color(0xFF2E66D7)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (_selectedImage != null) ...[
                  Stack(
                    alignment: Alignment.topRight,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(
                          _selectedImage!,
                          height: 500,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.red),
                        onPressed: () {
                          setState(() {
                            _selectedImage = null;
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
                const SizedBox(height: 16),

                // Title Field
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: 'Title',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                ),
                const SizedBox(height: 16),

                // Description Field
                TextFormField(
                  controller: _contentController,
                  decoration: InputDecoration(
                    labelText: 'Description',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                  maxLines: 5,
                ),
                const SizedBox(height: 16),

                // Category Dropdown
                DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: InputDecoration(
                    labelText: 'Category',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                  onChanged: (String? newValue) {
                    setState(() {
                      selectedCategory = newValue!;
                    });
                  },
                  items: _categories.map((String category) {
                    return DropdownMenuItem<String>(
                      value: category,
                      child: Text(category),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Location Picker
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _getCurrentLocation,
                  icon: const Icon(Icons.upload, color: Color(0xFF2E66D7)),
                  label: const Text('Add Current Location',
                      style: TextStyle(color: Color(0xFF2E66D7))),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[50],
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Color(0xFF2E66D7)),
                    ),
                  ),
                ),
                if (_currentPosition != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'Location: ${_currentPosition!.latitude}, ${_currentPosition!.longitude}',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                const SizedBox(height: 16),

                // Submit Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _submitPost,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E66D7),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Submit Post',
                          style: TextStyle(color: Colors.white),
                        ),
                ),
                SizedBox(height: 90),
              ],
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }
}
