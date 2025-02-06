import 'package:flutter/material.dart';

class ProfilePg extends StatefulWidget {
  const ProfilePg({Key? key}) : super(key: key);

  @override
  _ProfilePgState createState() => _ProfilePgState();
}

class _ProfilePgState extends State<ProfilePg> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 20,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
      ),
      backgroundColor: Colors.grey[50], // Light grey background
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Profile Picture
              Center(
                child: CircleAvatar(
                  radius: 60,
                  backgroundImage: AssetImage(
                      'assets/profile_pic.jpeg'), // Replace with your asset path
                  backgroundColor: Colors.grey[200],
                ),
              ),
              const SizedBox(height: 16.0),

              // User Name
              const Text(
                'Soham Kelaskar',
                style: TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 8.0),

              // User Email or Info
              const Text(
                'soham03@gmail.com',
                style: TextStyle(
                  fontSize: 16.0,
                  color: Colors.grey,
                ),
              ),

              const SizedBox(height: 24.0),

              // Profile Details
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Add any additional profile information here
                    _buildProfileDetail('Phone', '+91 91568 54149'),
                    const Divider(),
                    _buildProfileDetail('Address', 'Thane, Maharashtra'),
                  ],
                ),
              ),

              const SizedBox(height: 24.0),

              // Edit Profile Button
              ElevatedButton.icon(
                onPressed: () {
                  // Add functionality for editing profile
                },
                icon: const Icon(Icons.edit,
                    color: Colors.white), // Icon color set to white
                label: const Text(
                  'Edit Profile',
                  style:
                      TextStyle(color: Colors.white), // Text color set to white
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[900], // Dark blue color
                  padding: const EdgeInsets.symmetric(
                      vertical: 12.0, horizontal: 24.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),

              const SizedBox(height: 16.0),

              // Logout Button
              ElevatedButton.icon(
                onPressed: () {
                  // Add functionality for logout
                },
                icon: const Icon(Icons.logout,
                    color: Colors.white), // Icon color set to white
                label: const Text(
                  'Logout',
                  style:
                      TextStyle(color: Colors.white), // Text color set to white
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, // Red color for logout
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
      ),
    );
  }

  // Helper method to build profile detail sections
  Widget _buildProfileDetail(String title, String detail) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16.0, fontWeight: FontWeight.w500),
          ),
          Text(
            detail,
            style: const TextStyle(fontSize: 16.0, color: Colors.black54),
          ),
        ],
      ),
    );
  }
}
