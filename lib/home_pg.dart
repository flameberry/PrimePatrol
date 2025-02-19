import 'package:flutter/material.dart';
import 'package:smartwater/shop_pg.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// Post class remains the same
class Post {
  final String id;
  final String title;
  final String content;
  final String imageUrl;
  final String? status;
  final DateTime createdAt;

  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
    this.status,
    required this.createdAt,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    try {
      return Post(
        id: json['_id'] ?? '',
        title: json['title'] ?? 'Untitled',
        content: json['content'] ?? 'No content',
        imageUrl: json['imageUrl'] ?? '',
        status: json['status'],
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'])
            : DateTime.now(),
      );
    } catch (e) {
      print('Error parsing post: $json');
      print('Error details: $e');
      rethrow;
    }
  }
}

class HomePg extends StatefulWidget {
  const HomePg({super.key});

  @override
  State<HomePg> createState() => _HomePgState();
}

class _HomePgState extends State<HomePg> {
  int currentIndex = 0;
  bool isLoading = true;
  String? error;
  List<Post> posts = [];

  final String apiUrl = "http://192.168.1.3:3000/posts";

  @override
  void initState() {
    super.initState();
    fetchPosts();
  }

  Future<void> fetchPosts() async {
    try {
      final response = await http.get(Uri.parse(apiUrl));
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          posts = data.map((item) => Post.fromJson(item)).toList();
          isLoading = false;
          error = null;
        });
      } else {
        throw Exception('Failed to load posts: ${response.statusCode}');
      }
    } catch (e) {
      print("Error fetching posts: $e");
      setState(() {
        isLoading = false;
        error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(toolbarHeight: 20, backgroundColor: Colors.white),
      backgroundColor: Colors.white,
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $error'),
                      ElevatedButton(
                        onPressed: fetchPosts,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Welcome User',
                              style: TextStyle(
                                fontSize: 24.0,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Row(
                              children: [
                                const Text(
                                  '10',
                                  style: TextStyle(
                                      fontSize: 18.0, color: Colors.black),
                                ),
                                const SizedBox(width: 8.0),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => const ShopPg(),
                                      ),
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(8.0),
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors.blue[900],
                                    ),
                                    child: const Icon(
                                      Icons.water_drop,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      if (posts.isNotEmpty)
                        Container(
                          constraints: const BoxConstraints(maxHeight: 500),
                          child: SingleChildScrollView(
                            child: Column(
                              children: [
                                SizedBox(
                                  height: 300,
                                  child: GestureDetector(
                                    onHorizontalDragEnd: (details) {
                                      setState(() {
                                        if (details.primaryVelocity! < 0) {
                                          currentIndex =
                                              (currentIndex + 1) % posts.length;
                                        } else if (details.primaryVelocity! >
                                            0) {
                                          currentIndex = (currentIndex -
                                                  1 +
                                                  posts.length) %
                                              posts.length;
                                        }
                                      });
                                    },
                                    child: Stack(
                                      alignment: Alignment.center,
                                      children:
                                          posts.asMap().entries.map((entry) {
                                        int idx = entry.key;
                                        Post post = entry.value;

                                        return AnimatedOpacity(
                                          duration:
                                              const Duration(milliseconds: 300),
                                          opacity:
                                              idx == currentIndex ? 1.0 : 0.0,
                                          child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(15.0),
                                            child: Image.network(
                                              post.imageUrl,
                                              width: 300.0,
                                              height: 300.0,
                                              fit: BoxFit.cover,
                                              loadingBuilder: (context, child,
                                                  loadingProgress) {
                                                if (loadingProgress == null) {
                                                  return child;
                                                }
                                                return const Center(
                                                  child:
                                                      CircularProgressIndicator(),
                                                );
                                              },
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return const Center(
                                                  child: Text(
                                                      'Failed to load image'),
                                                );
                                              },
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    children: [
                                      Text(
                                        posts[currentIndex].title,
                                        style: const TextStyle(
                                          fontSize: 18.0,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 8.0),
                                      Text(
                                        posts[currentIndex].content,
                                        style: const TextStyle(
                                          fontSize: 16.0,
                                          color: Colors.black54,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 8.0),
                                      if (posts[currentIndex].status != null)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12.0,
                                            vertical: 6.0,
                                          ),
                                          decoration: BoxDecoration(
                                            color: posts[currentIndex].status ==
                                                    'pending'
                                                ? Colors.orange[100]
                                                : Colors.green[100],
                                            borderRadius:
                                                BorderRadius.circular(20.0),
                                          ),
                                          child: Text(
                                            posts[currentIndex]
                                                .status!
                                                .toUpperCase(),
                                            style: TextStyle(
                                              color:
                                                  posts[currentIndex].status ==
                                                          'pending'
                                                      ? Colors.orange[900]
                                                      : Colors.green[900],
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text('No posts available'),
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }
}
