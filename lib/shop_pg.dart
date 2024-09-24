import 'package:flutter/material.dart';

class ShopPg extends StatefulWidget {
  const ShopPg({super.key});

  @override
  State<ShopPg> createState() => _ShopPgState();
}

class _ShopPgState extends State<ShopPg> {
  final List<Product> products = [
    Product(name: 'T-Shirt', price: 30, imagePath: 'assets/tshirt.png'),
    Product(name: 'Coffee Mug', price: 10, imagePath: 'assets/coffee_mug.png'),
    Product(name: 'Poster', price: 15, imagePath: 'assets/poster.png'),
    Product(name: 'Tote Bag', price: 25, imagePath: 'assets/tote_bag.png'),
  ];

  final List<Product> cart = []; // List to keep track of added products

  // Method to add a product to the cart
  void addToCart(Product product) {
    setState(() {
      cart.add(product);
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('${product.name} added to cart!'),
      duration: Duration(seconds: 1),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text('Shop'),
        actions: [
          // Cart icon in the app bar
          IconButton(
            icon: Icon(Icons.shopping_cart),
            onPressed: () {
              // Navigate to cart page or show cart items
            },
          ),
        ],
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(30.0),
        child: GridView.builder(
          itemCount: products.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 1, // 1 product per row
            childAspectRatio: 2 / 3, // Adjust ratio to make cards look better
            crossAxisSpacing: 10,
            mainAxisSpacing: 30,
          ),
          itemBuilder: (context, index) {
            return ProductCard(
              product: products[index],
              addToCart: () =>
                  addToCart(products[index]), // Add to cart callback
            );
          },
        ),
      ),
    );
  }
}

class Product {
  final String name;
  final int price;
  final String imagePath;

  Product({required this.name, required this.price, required this.imagePath});
}

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback addToCart; // Callback function to add product to cart

  ProductCard({required this.product, required this.addToCart});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      elevation: 5,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(10)),
              child: Image.asset(
                product.imagePath,
                fit: BoxFit.cover,
                width: double.infinity,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              product.name,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.water_drop,
                    color: Color(0xFF2E66D7)), // Water drop icon
                SizedBox(width: 5),
                Text(
                  '${product.price}',
                  style: TextStyle(
                      fontSize: 18,
                      color: Color(0xFF2E66D7),
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF2E66D7), // Dark blue background
                foregroundColor: Colors.white, // White text
                padding: EdgeInsets.symmetric(
                    horizontal: 24, vertical: 12), // Optional padding
                textStyle: TextStyle(fontSize: 16), // Optional text style
              ),
              onPressed: addToCart, // Add product to cart on button press
              child: Text('Add to Cart'),
            ),
          ),
        ],
      ),
    );
  }
}
