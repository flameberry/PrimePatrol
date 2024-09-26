import 'package:flutter/material.dart';
import 'package:smartwater/shop_pg.dart';

class HomePg extends StatefulWidget {
  const HomePg({super.key});

  @override
  State<HomePg> createState() => _HomePgState();
}

class _HomePgState extends State<HomePg> {
  int currentIndex = 0;
  String selectedCategory = 'Categories'; // Default selected category

  // Categories for dropdown
  final List<String> categories = [
    'Categories',
    'Garbage Disposal',
    'Flooding',
    'Industrial Waste'
  ];

  // Image list for swipable stack
  final List<String> imagePaths = [
    'assets/inds.png',
    'assets/garbage.png',
    'assets/water_prob.png',
  ];

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
          // Welcome text and water drop icon
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Welcome User', // "Welcome User" text at the top
                  style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    const Text(
                      '10', // Text to the left of the icon
                      style: TextStyle(
                        fontSize: 18.0,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(width: 8.0), // Spacing between text and icon
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const ShopPg()));
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8.0),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.blue[900], // Blue circle background
                        ),
                        child: const Icon(
                          Icons.water_drop, // Water drop icon
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Dropdown for categories
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white, // White background
                border: Border.all(color: Colors.black), // Black border
                borderRadius: BorderRadius.circular(10),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0),
                child: DropdownButton<String>(
                  value: selectedCategory,
                  isExpanded: true, // Make the dropdown fill the width
                  underline: const SizedBox(), // Remove the default underline
                  alignment: Alignment.center, // Center the dropdown text
                  onChanged: (String? newValue) {
                    setState(() {
                      selectedCategory = newValue!;
                    });
                  },
                  items: categories
                      .map<DropdownMenuItem<String>>((String category) {
                    return DropdownMenuItem<String>(
                      value: category,
                      child: Center(
                        // Center the text within each dropdown item
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
                ),
              ),
            ),
          ),

          // Stack displaying images with rounded corners
          SizedBox(
            height: 420.0, // Height for the swipeable stack
            child: Center(
              child: GestureDetector(
                onHorizontalDragEnd: (details) {
                  setState(() {
                    if (details.primaryVelocity! < 0) {
                      // Swipe left
                      currentIndex = (currentIndex + 1) % imagePaths.length;
                    } else if (details.primaryVelocity! > 0) {
                      // Swipe right
                      currentIndex = (currentIndex - 1 + imagePaths.length) %
                          imagePaths.length;
                    }
                  });
                },
                child: Stack(
                  alignment: Alignment.center,
                  children: imagePaths.asMap().entries.map((entry) {
                    int idx = entry.key;
                    String imagePath = entry.value;

                    return AnimatedOpacity(
                      duration: const Duration(milliseconds: 300),
                      opacity: idx == currentIndex ? 1.0 : 0.0,
                      child: ClipRRect(
                        borderRadius:
                            BorderRadius.circular(15.0), // Rounded corners
                        child: Image.asset(
                          imagePath,
                          width: 300.0,
                          height: 300.0,
                          fit: BoxFit.cover,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),

          // Box with caution icon and text
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black), // Black border
                borderRadius: BorderRadius.circular(10),
                color: Colors.white, // White background
              ),
              padding:
                  const EdgeInsets.symmetric(vertical: 20.0, horizontal: 10.0),
              child: const Row(
                children: [
                  Icon(
                    Icons.warning, // Caution icon
                    color: Colors.red, // Icon color
                    size: 30.0, // Icon size
                  ),
                  SizedBox(width: 10.0), // Space between icon and text
                  Expanded(
                    child: Text(
                      '20 cases reported in 24 hrs', // Sample text
                      style: TextStyle(fontSize: 16.0, color: Colors.black),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
