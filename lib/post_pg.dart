import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class PostPg extends StatefulWidget {
  const PostPg({Key? key}) : super(key: key);

  @override
  _PostPgState createState() => _PostPgState();
}

class _PostPgState extends State<PostPg> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _postController = TextEditingController();
  File? _selectedImage;

  // Function to pick an image from the gallery
  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  // Function to handle post submission
  void _submitPost() {
    if (_formKey.currentState!.validate()) {
      // Handle the post submission logic here
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Post submitted successfully!')),
      );
      _postController.clear();
      setState(() {
        _selectedImage = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 20,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Post Text Field
              TextFormField(
                controller: _postController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: 'What’s on your mind?',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.blue[900]!),
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter some text';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16.0),

              // Display selected image
              if (_selectedImage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16.0),
                  height: 200.0,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12.0),
                    image: DecorationImage(
                      image: FileImage(_selectedImage!),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),

              // Add Image Button
              ElevatedButton.icon(
                onPressed: _pickImage,
                icon: const Icon(Icons.add_photo_alternate),
                label: const Text('Add Image'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[900],
                  padding: const EdgeInsets.symmetric(
                      vertical: 12.0, horizontal: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),

              SizedBox(
                height: 80,
              ),

              // Submit Post Button
              Center(
                child: ElevatedButton(
                  onPressed: _submitPost,
                  child: const Text('Submit Post'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        const Color(0xFF2E66D7), // Custom dark blue color
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
        ),
      ),
    );
  }
}
