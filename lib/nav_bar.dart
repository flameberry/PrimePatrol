import 'package:flutter/material.dart';
import 'package:smartwater/post_pg.dart';
import 'package:smartwater/profile_pg.dart';
import 'package:smartwater/search_pg.dart';
import 'package:smartwater/shop_pg.dart';
import 'package:circle_nav_bar/circle_nav_bar.dart';
import 'home_pg.dart';

class NavBar extends StatefulWidget {
  const NavBar({super.key});

  @override
  State<NavBar> createState() => _NavBarState();
}

class _NavBarState extends State<NavBar> {
  int _tabIndex = 1;
  late final PageController pageController;

  @override
  void initState() {
    super.initState();
    pageController = PageController(initialPage: _tabIndex);
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      bottomNavigationBar: CircleNavBar(
        activeIcons: const [
          Icon(Icons.add_box, color: Colors.white), // Post
          Icon(Icons.home, color: Colors.white), // Home
          Icon(Icons.person, color: Colors.white), // Profile
        ],
        inactiveIcons: const [
          Text(
            "Post",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            "Home",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            "Profile",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
        color: Color(0xFF2E66D7),
        height: 65,
        circleWidth: 60,
        activeIndex: _tabIndex,
        onTap: (index) {
          setState(() {
            _tabIndex = index;
            pageController.jumpToPage(_tabIndex);
          });
        },
        padding: const EdgeInsets.only(left: 0, right: 0, bottom: 0),
        cornerRadius: const BorderRadius.only(
          topLeft: Radius.circular(18),
          topRight: Radius.circular(18),
          bottomRight: Radius.circular(1),
          bottomLeft: Radius.circular(1),
        ),
        shadowColor: Colors.blueAccent,
        elevation: 0,
      ),
      body: PageView(
        controller: pageController,
        onPageChanged: (index) {
          setState(() {
            _tabIndex = index;
          });
        },
        children: const [
          PostPg(), // Post Page
          HomePg(), // Home Page
          ProfilePg(), // Profile Page
        ],
      ),
    );
  }
}
