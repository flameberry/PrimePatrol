import 'package:flutter/material.dart';
import 'package:smartwater/login_pg.dart';
import 'package:smartwater/volunteer_home.dart';

class VolunteerLoginPage extends StatefulWidget {
  @override
  _VolunteerLoginPageState createState() => _VolunteerLoginPageState();
}

class _VolunteerLoginPageState extends State<VolunteerLoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  void _loginAsVolunteer() {
    if (_formKey.currentState!.validate()) {
      // Implement volunteer login logic here
      print("Logging in as Volunteer: ${_emailController.text}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Set background color to white
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                SizedBox(height: 60),
                // App logo
                Container(
                  margin: EdgeInsets.only(bottom: 24.0),
                  child: Image.asset(
                    'assets/logo.png', // Add your app logo image path here
                    height: 160.0, // Set the height of the logo
                    width: 160.0, // Set the width of the logo
                  ),
                ),
                Text(
                  'Volunteer Login',
                  style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2E66D7),
                  ),
                ),
                SizedBox(height: 8.0),
                Text(
                  'Sign in to become a volunteer',
                  style: TextStyle(
                    fontSize: 16.0,
                    color: Colors.grey[600],
                  ),
                ),
                SizedBox(height: 40.0),
                // Email Text Field
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 2,
                        blurRadius: 8,
                        offset: Offset(0, 3),
                      )
                    ],
                  ),
                  child: TextFormField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 14.0),
                      labelText: 'Email',
                      labelStyle: TextStyle(color: Colors.grey[600]),
                      prefixIcon: Icon(Icons.email, color: Colors.grey[600]),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      } else if (!RegExp(r'^[^@]+@[^@]+\.[^@]+')
                          .hasMatch(value)) {
                        return 'Enter a valid email';
                      }
                      return null;
                    },
                  ),
                ),
                SizedBox(height: 20.0),
                // Password Text Field
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 2,
                        blurRadius: 8,
                        offset: Offset(0, 3),
                      )
                    ],
                  ),
                  child: TextFormField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 14.0),
                      labelText: 'Password',
                      labelStyle: TextStyle(color: Colors.grey[600]),
                      prefixIcon: Icon(Icons.lock, color: Colors.grey[600]),
                    ),
                    obscureText: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      } else if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                ),
                SizedBox(height: 24.0),
                // Login Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => VolunteerHome()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF2E66D7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      elevation: 5,
                    ),
                    child: Text(
                      'Login as Volunteer',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 20.0),
                // OR Divider
                Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: Colors.grey[400],
                        thickness: 1,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8.0),
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14.0,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: Colors.grey[400],
                        thickness: 1,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.0),
                // Google Sign-In Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      // Implement Google sign-in for volunteers here
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                      elevation: 5,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/google_logo.png', // Add Google logo asset
                          height: 24.0,
                          width: 24.0,
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Sign in with Google',
                          style: TextStyle(
                            color: Colors.grey[800],
                            fontSize: 16.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 20.0),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => LoginPg()),
                    );
                  },
                  child: Text(
                    'Login as User',
                    style: TextStyle(
                      color: Color(0xFF2E66D7),
                      fontSize: 14.0,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
