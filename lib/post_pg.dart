import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

class PostPg extends StatefulWidget {
  final String userId = "67b79c666bb869d943773a4f";

  const PostPg({Key? key}) : super(key: key);

  @override
  _PostPgState createState() => _PostPgState();
}

class _PostPgState extends State<PostPg> {
  final TextEditingController _titleController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  String selectedCategory = 'Select Category';
  String? _selectedLocation;
  final TextEditingController _contentController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  // API URL - Replace with your actual API URL
  static const String API_URL = "http://192.168.1.3:3000";

  final List<String> _categories = [
    'Select Category',
    'Garbage Disposal',
    'Flooding',
    'Industrial Waste'
  ];
  String? _userId;
  String? _fcmToken;

  @override
  void initState() {
    super.initState();
    _initFirebaseMessaging();
    _getUserId(); // Get current user ID when component mounts
  }

  Future<void> _getUserId() async {
    User? currentUser = FirebaseAuth.instance.currentUser;
    setState(() {
      _userId = currentUser?.uid;
    });
    print('Current user ID: $_userId');
  }

  Future<void> _initFirebaseMessaging() async {
    // Request notification permissions
    await FirebaseMessaging.instance.requestPermission();

    // Get the token
    _fcmToken = await FirebaseMessaging.instance.getToken();
    print('FCM Token: $_fcmToken');

    // Listen for token refreshes
    FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
      setState(() {
        _fcmToken = newToken;
      });
      // if (_userId != null) {
      //   _sendTokenToBackend(newToken, _userId!);
      // }
    });

    // Send the initial token to backend (only if user is logged in)
    // if (_fcmToken != null && _userId != null) {
    //   _sendTokenToBackend(_fcmToken!, _userId!);
    // }

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print('Message notification: ${message.notification!.title}');
        print('Message notification: ${message.notification!.body}');

        // Show in-app notification (optional)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message.notification!.body ?? 'New notification'),
            duration: Duration(seconds: 3),
          ),
        );
      }
    });
  }

  Future<void> _sendTokenToBackend(String token, String userId) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: '10.0.2.2',
        port: 5672,
        authProvider: PlainAuthenticator('guest', 'guest'),
      );

      Client client = Client(settings: settings);
      Channel channel = await client.channel();
      Queue queue = await channel.queue('token_queue', durable: true);

      // Create token payload
      String jsonMessage = jsonEncode({"userId": userId, "fcmToken": token});

      // Send token to queue
      queue.publish(jsonMessage);
      print('✅ FCM token sent to queue successfully for user: $userId');
      client.close();
    } catch (e) {
      print('❌ Error sending FCM token to RabbitMQ: $e');
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

  Future<void> _sendPushNotification() async {
    try {
      // Make sure we have the user ID
      if (_userId == null) {
        User? currentUser = FirebaseAuth.instance.currentUser;
        if (currentUser == null) {
          print('❌ Cannot send notification: User not logged in');
          return;
        }
        _userId = currentUser.uid;
      }

      if (_fcmToken == null) {
        print('❌ Cannot send notification: FCM token not available');
        return;
      }

      final ConnectionSettings settings = ConnectionSettings(
        host: '10.0.2.2',
        port: 5672,
        authProvider: PlainAuthenticator('guest', 'guest'),
      );

      Client client = Client(settings: settings);
      Channel channel = await client.channel();
      Queue queue = await channel.queue('notification_queue', durable: true);

      String jsonMessage =
          jsonEncode({"user_token": _userId, "fcm_token": _fcmToken});

      // Send message
      queue.publish(jsonMessage);
      print(
          '✅ Notification request sent to queue successfully for token: $_fcmToken');
      client.close();
    } catch (e) {
      print('❌ Error sending notification request to RabbitMQ: $e');
    }
  }

  Future<void> _sendImageToQueue(File imageFile) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: '10.0.2.2', // Emulator-to-host mapping for RabbitMQ
        port: 5672,
        // authProvider: PlainAuthenticator('myuser', 'mypassword'),
        authProvider: PlainAuthenticator('guest', 'guest'),
      );

      Client client = Client(settings: settings);
      Channel channel = await client.channel();
      Queue queue = await channel.queue('image_queue', durable: true);

      // Convert image to Base64
      List<int> imageBytes = await imageFile.readAsBytes();
      String base64Image = base64Encode(imageBytes);

      // Create JSON payload
      String jsonMessage = jsonEncode({"image": base64Image});

      // Send message
      queue.publish(jsonMessage);
      print('✅ Image sent to queue successfully');

      client.close();
    } catch (e) {
      print('❌ Error sending image to RabbitMQ: $e');
    }
  }

  // Function to handle map interaction (dummy for now)
  Future<void> _pickLocation() async {
    // Simulate a location being picked for demonstration
    setState(() {
      _selectedLocation = '37.7749, -122.4194'; // Example location
    });
  }

  // Function to handle post submission
  Future<void> _submitPost() async {
    print('Submit Post button pressed');

    if (_titleController.text.isEmpty || _contentController.text.isEmpty) {
      print('Title or content is empty');
      setState(() {
        _errorMessage = 'Please fill in both title and content fields';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print('Creating multipart request');
      final url = Uri.parse('$API_URL/posts');
      var request = http.MultipartRequest('POST', url);

      final String postId = Uuid().v4();
      print('Generated Post ID: $postId');

      request.fields.addAll({
        'postId': postId,
        'title': _titleController.text,
        'content': _contentController.text,
        'userId': widget.userId,
        'status': 'pending',
      });

      print('Request fields: ${request.fields}');

      if (_selectedImage != null) {
        print('Adding image to request');
        try {
          var imageStream = http.ByteStream(_selectedImage!.openRead());
          var length = await _selectedImage!.length();

          print('Image path: ${_selectedImage!.path}');
          print('Image size: $length bytes');

          var multipartFile = http.MultipartFile('image', imageStream, length,
              filename: _selectedImage!.path.split('/').last);
          request.files.add(multipartFile);
        } catch (e) {
          print('Failed to process image: $e');
          throw Exception('Failed to process image: $e');
        }
      }

      print('Sending request to: $url');
      var streamedResponse = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          print('Request timed out');
          throw Exception('Request timed out');
        },
      );

      // Get response
      var response = await http.Response.fromStream(streamedResponse);
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

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

          // Reset form
          setState(() {
            _selectedImage = null;
            _titleController.clear();
            _contentController.clear();
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

    if (_selectedImage != null) {
      print('Sending image to queue');
      _sendImageToQueue(_selectedImage!);
    }

    print('Sending push notification');
    _sendPushNotification();
  }

// Function to update the user's postIds array
  Future<void> _updateUserPostIds(String postId) async {
    try {
      final url = Uri.parse('$API_URL/users/${widget.userId}');
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'postIds': [
            postId
          ], // Append the new postId to the user's postIds array
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ User postIds updated successfully');
      } else {
        print('❌ Failed to update user postIds: ${response.body}');
        throw Exception('Failed to update user postIds');
      }
    } catch (e) {
      print('❌ Error updating user postIds: $e');
      throw Exception('Error updating user postIds: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 50,
        backgroundColor: Colors.white,
        title: const Text(
          'Submit a Post',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
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
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E66D7),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: const Icon(Icons.upload, color: Colors.white),
                  label: const Text(
                    'Upload Image',
                    style: TextStyle(color: Colors.white),
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
                          height: 200,
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
                ElevatedButton(
                  onPressed: _pickLocation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E66D7),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Add Current Location',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                if (_selectedLocation != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'Location: $_selectedLocation',
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
