import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_auth/firebase_auth.dart';

class PostPg extends StatefulWidget {
  const PostPg({Key? key}) : super(key: key);

  @override
  _PostPgState createState() => _PostPgState();
}

class _PostPgState extends State<PostPg> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  String selectedCategory = 'Select Category';
  String? _selectedLocation;

  int _currentStep = 1;

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
      String jsonMessage = jsonEncode({
        "userId": userId,
        "fcmToken": token
      });

      // Send token to queue
      queue.publish(jsonMessage);
      print('✅ FCM token sent to queue successfully for user: $userId');
      client.close();
    } catch (e) {
      print('❌ Error sending FCM token to RabbitMQ: $e');
    }
  }

  // Function to pick an image
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

      String jsonMessage = jsonEncode({
        "user_token": _userId,
        "fcm_token": _fcmToken
      });

      // Send message
      queue.publish(jsonMessage);
      print('✅ Notification request sent to queue successfully for token: $_fcmToken');
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
  void _submitPost() {
    if (_selectedImage != null) {
      _sendImageToQueue(_selectedImage!);
    }
    _sendPushNotification();
    // _sendPushNotification(
    // 'Post Created',
    // 'Your ${selectedCategory.toLowerCase()} post was successfully submitted!'
    // );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Post submitted successfully!')),
    );

    setState(() {
      _selectedImage = null;
      _titleController.clear();
      _descriptionController.clear();
      _selectedLocation = null;
      selectedCategory = 'Select Category';
      _currentStep = 1;
    });
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Upload Section
            ElevatedButton(
              onPressed: _pickImage,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E66D7),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Upload Image',
                style: TextStyle(color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            if (_selectedImage != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.file(
                  _selectedImage!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
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
              controller: _descriptionController,
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
              onPressed: _submitPost,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E66D7),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Submit Post',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
