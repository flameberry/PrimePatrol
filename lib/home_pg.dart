import 'package:flutter/material.dart';

class HomePg extends StatefulWidget {
  const HomePg({super.key});

  @override
  State<HomePg> createState() => _HomePgState();
}

class _HomePgState extends State<HomePg> {
  int currentIndex = 0;

  // Dummy list for swipable stack
  final List<Widget> _items = List.generate(
    5, // For demo purposes, 5 swipable rectangles
    (index) => Container(
      width: 300.0,
      height: 400.0,
      margin: EdgeInsets.symmetric(vertical: 10.0),
      decoration: BoxDecoration(
        color: Colors.blue[100 * (index + 1)], // Different shades of blue
        borderRadius: BorderRadius.circular(16.0),
      ),
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 20,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
      ),
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Welcome User', // "Welcome User" text at the top
                  style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    Text(
                      '10', // Text to the left of the icon
                      style: TextStyle(
                        fontSize: 18.0,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(width: 8.0), // Spacing between text and icon
                    Container(
                      padding: EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.blue[900], // Blue circle background
                      ),
                      child: Icon(
                        Icons.water_drop, // Water drop icon
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: GestureDetector(
                onHorizontalDragEnd: (details) {
                  setState(() {
                    if (details.primaryVelocity! < 0) {
                      // Swipe left
                      currentIndex = (currentIndex + 1) % _items.length;
                    } else if (details.primaryVelocity! > 0) {
                      // Swipe right
                      currentIndex =
                          (currentIndex - 1 + _items.length) % _items.length;
                    }
                  });
                },
                child: Stack(
                  alignment: Alignment.center,
                  children: _items.asMap().entries.map((entry) {
                    int idx = entry.key;
                    Widget item = entry.value;

                    return AnimatedOpacity(
                      duration: Duration(milliseconds: 300),
                      opacity: idx == currentIndex ? 1.0 : 0.0,
                      child: item,
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
