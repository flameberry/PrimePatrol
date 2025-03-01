import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:smartwater/login_pg.dart';

class ProfilePg extends StatefulWidget {
  const ProfilePg({Key? key}) : super(key: key);

  @override
  _ProfilePgState createState() => _ProfilePgState();
}

class _ProfilePgState extends State<ProfilePg> {
  final User? user = FirebaseAuth.instance.currentUser; // Get current user

  @override
  Widget build(BuildContext context) {
    String userEmail = user?.email ?? 'No Email';
    String userName = user?.displayName ?? 'User';
    String? photoUrl = user?.photoURL; // Get profile picture URL

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 50,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.grey[50],
        title: const Text(
          'Your Profile',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
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
                  backgroundColor: Colors.grey[200],
                  backgroundImage: photoUrl != null
                      ? NetworkImage(photoUrl)
                      : null, // Load profile image if available
                  child: photoUrl == null
                      ? Text(
                          userName.isNotEmpty
                              ? userName[0].toUpperCase()
                              : '?', // Show initial if no photo
                          style: const TextStyle(
                              fontSize: 40, fontWeight: FontWeight.bold),
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 16.0),

              // User Name
              Text(
                userName,
                style: const TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 8.0),

              // User Email
              Text(
                userEmail,
                style: const TextStyle(
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
                    _buildProfileDetail('Phone', user?.phoneNumber ?? 'N/A'),
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
                icon: const Icon(Icons.edit, color: Colors.white),
                label: const Text('Edit Profile',
                    style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E66D7), // Dark blue color
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
                  FirebaseAuth.instance.signOut().then((_) {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (context) => LoginPg()),
                    );
                  });
                },
                icon: const Icon(Icons.logout, color: Colors.white),
                label:
                    const Text('Logout', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
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
