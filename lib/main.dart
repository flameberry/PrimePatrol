import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'login_pg.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      routes: {
        '/login': (context) => LoginPg(),
      },
      title: 'SmartWater',
      debugShowCheckedModeBanner: false,
      home: LoginPg(),
    );
  }
}
