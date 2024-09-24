import 'package:flutter/material.dart';
import 'package:smartwater/nav_bar.dart';
import 'login_pg.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      routes: {
        '/login': (context) => LoginPg(),
      },
      title: 'NeuroCare',
      debugShowCheckedModeBanner: false,
      home: LoginPg(),
    );
  }
}
