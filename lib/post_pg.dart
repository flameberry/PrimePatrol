import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';

class PostPg extends StatefulWidget {
  const PostPg({Key? key}) : super(key: key);

  @override
  _PostPgState createState() => _PostPgState();
}

class _PostPgState extends State<PostPg> {
  final _formKey = GlobalKey<FormState>();
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

  // Function to pick an image
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  // Future<void> _sendImageToQueue(File imageFile) async {
  //   try {
  //     final ConnectionSettings settings = ConnectionSettings(
  //       host: '10.0.2.2', // Change if RabbitMQ is on another machine
  //       port: 5672, // Default RabbitMQ port
  //       authProvider: PlainAuthenticator('myuser', 'mypassword'),
  //     );
  //
  //     Client client = Client(settings: settings);
  //     Channel channel = await client.channel();
  //     Queue queue = await channel.queue('image_queue', durable: true);
  //
  //     // Convert image to base64
  //     List<int> imageBytes = await imageFile.readAsBytes();
  //     String base64Image = base64Encode(imageBytes);
  //
  //     // Send message
  //     queue.publish(base64Image);
  //     print('Image sent to queue successfully');
  //
  //     client.close();
  //   } catch (e) {
  //     print('Error sending image to RabbitMQ: $e');
  //   }
  // }

  Future<void> _sendImageToQueue(File imageFile) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: '10.0.2.2', // Emulator-to-host mapping for RabbitMQ
        port: 5672,
        authProvider: PlainAuthenticator('myuser', 'mypassword'),
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

  // Helper function to create timeline steps
  Widget _buildTimelineStep(int step, String label) {
    bool isActive = _currentStep >= step;
    return Expanded(
      child: Column(
        children: [
          CircleAvatar(
            radius: 15,
            backgroundColor: isActive ? Color(0xFF2E66D7) : Colors.grey,
            child: Text(
              '$step',
              style: const TextStyle(color: Colors.white),
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12)),
          if (step != 6)
            Container(
              height: 2.0,
              width: 30.0,
              color: isActive ? Color(0xFF2E66D7) : Colors.grey,
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 20,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Timeline showing the steps
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildTimelineStep(1, 'Step 1'),
                      _buildTimelineStep(2, 'Step 2'),
                      _buildTimelineStep(3, 'Step 3'),
                      _buildTimelineStep(4, 'Step 4'),
                      _buildTimelineStep(5, 'Step 5'),
                      _buildTimelineStep(6, 'Done'),
                    ],
                  ),
                  const SizedBox(height: 20.0),

                  // Displaying different steps based on currentStep
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_currentStep == 1)
                          Column(
                            children: [
                              ElevatedButton.icon(
                                onPressed: _pickImage,
                                icon: const Icon(Icons.add_photo_alternate,
                                    color: Colors.white),
                                label: const Text('Upload Image'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFF2E66D7),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 12.0, horizontal: 16.0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16.0),
                              if (_selectedImage !=
                                  null) // Display the selected image
                                Container(
                                  height: 200.0,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12.0),
                                    image: DecorationImage(
                                      image: FileImage(_selectedImage!),
                                      fit: BoxFit.cover,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey.withOpacity(0.5),
                                        spreadRadius: 5,
                                        blurRadius: 7,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        if (_currentStep == 2 && _selectedImage != null)
                          Column(
                            children: [
                              const SizedBox(height: 16.0),
                              TextFormField(
                                controller: _titleController,
                                decoration: InputDecoration(
                                  hintText: 'Add a title',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey[100],
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter a title';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16.0),
                              TextFormField(
                                controller: _descriptionController,
                                maxLines: 5,
                                decoration: InputDecoration(
                                  hintText: 'Add a description',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey[100],
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter a description';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),
                        if (_currentStep == 3)
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 12.0),
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: Colors.grey[100],
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.5),
                                    spreadRadius: 5,
                                    blurRadius: 7,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: DropdownButton<String>(
                                value: selectedCategory,
                                isExpanded: true,
                                underline: const SizedBox(),
                                alignment: Alignment.center,
                                onChanged: (String? newValue) {
                                  setState(() {
                                    selectedCategory = newValue!;
                                  });
                                },
                                items: _categories.map((String category) {
                                  return DropdownMenuItem<String>(
                                    value: category,
                                    child: Center(
                                      child: Text(
                                        category,
                                        style: const TextStyle(
                                          fontSize: 16.0,
                                          color: Colors.black,
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                                style: const TextStyle(color: Colors.black),
                              ),
                            ),
                          ),
                        if (_currentStep == 4)
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              ElevatedButton.icon(
                                onPressed: _pickLocation,
                                icon: const Icon(Icons.location_on,
                                    color: Colors.white),
                                label: const Text('Add Current Location'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFF2E66D7),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 12.0, horizontal: 16.0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16.0),
                              if (_selectedLocation != null)
                                Text('Selected Location: $_selectedLocation',
                                    style: const TextStyle(fontSize: 16.0)),
                            ],
                          ),
                        if (_currentStep == 5 && _selectedLocation != null)
                          Column(
                            children: [
                              Container(
                                height: 200.0,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12.0),
                                  image: DecorationImage(
                                    image: FileImage(_selectedImage!),
                                    fit: BoxFit.cover,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.grey.withOpacity(0.5),
                                      spreadRadius: 5,
                                      blurRadius: 7,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16.0),
                              Text('Title: ${_titleController.text}'),
                              const SizedBox(height: 8.0),
                              Text(
                                  'Description: ${_descriptionController.text}'),
                              const SizedBox(height: 8.0),
                              Text('Category: $selectedCategory'),
                              const SizedBox(height: 8.0),
                              Text('Location: $_selectedLocation'),
                            ],
                          ),
                        if (_currentStep == 6)
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.check_circle,
                                    color: Colors.green, size: 100),
                                const SizedBox(height: 16.0),
                                ElevatedButton(
                                  onPressed: _submitPost,
                                  child: const Text('Return to Home'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xFF2E66D7),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12.0, horizontal: 24.0),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // "Next" Button to go through steps
          Padding(
            padding: const EdgeInsets.only(
                bottom: 100.0), // Adjust this padding as needed
            child: ElevatedButton(
              onPressed: () {
                if (_currentStep < 6) {
                  setState(() {
                    _currentStep++;
                  });
                }
              },
              child: const Text('Next'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF2E66D7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    vertical: 14.0, horizontal: 24.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
