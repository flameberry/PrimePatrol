import 'package:flutter/material.dart';
import 'package:smartwater/shop_pg.dart';
import 'package:http/http.dart' as http;
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';

class Post {
  final String id;
  final String title;
  final String content;
  final String imageUrl;
  final String? status;
  final DateTime createdAt;
  final String userid;
  int upvotes;
  int downvotes;

  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
    this.status,
    required this.userid,
    required this.createdAt,
    this.upvotes = 0,
    this.downvotes = 0,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['_id'] ?? '',
      title: json['title'] ?? 'Untitled',
      content: json['content'] ?? 'No content',
      imageUrl: json['imageUrl'] ?? '',
      status: json['status'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      upvotes: json['upvotes'] ?? 0,
      downvotes: json['downvotes'] ?? 0,
      userid: json['UserId'] ?? '',
    );
  }
}

class HomePg extends StatefulWidget {
  const HomePg({super.key});

  @override
  State<HomePg> createState() => _HomePgState();
}

class _HomePgState extends State<HomePg> {
  bool isLoading = true;
  String? error;
  List<Post> posts = [];
  final String apiUrl = "http://192.168.1.41:3000/posts";
  final String userApiUrl = "http://192.168.1.41:3000/users";

  @override
  void initState() {
    super.initState();
    fetchPosts();
  }
      Future<void> fetchPosts() async {
    try {
      final response = await http.get(Uri.parse(apiUrl));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          posts = data.map((item) => Post.fromJson(item)).toList();
          isLoading = false;
          error = null;
        });
      } else {
        throw Exception('Failed to load posts');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        error = e.toString();
      });
    }
  }

  Future<String?> getFCMToken(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$userApiUrl/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> usersData = json.decode(response.body);
        print('User Data Response: $usersData');

        // Check if we got any users back
        if (usersData.isNotEmpty) {
          // Get the first user from the array
          final userData = usersData[0];
          // Return the FCM token
          return userData['fcm_token'] as String?;
        } else {
          print('No user found with ID: $userId');
          return null;
        }
      } else {
        print('Failed to fetch FCM token: ${response.statusCode}');
        print('Response body: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error fetching FCM token: $e');
      print(StackTrace.current);
      return null;
    }
  }

  Future<void> sendPushNotification({
    required String fcmToken
  }) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: '10.0.2.2',
        // host: '192.168.1.41',
        port: 5672,
        authProvider: PlainAuthenticator('guest', 'guest'),
      );

      Client client = Client(settings: settings);
      Channel channel = await client.channel();
      Queue queue = await channel.queue('notification_queue', durable: true);

      String jsonMessage = jsonEncode({
        "fcm_token": fcmToken,
        "title": "Good JOB!!",
        "content": "Someone just upvoted your post!"
      });

      queue.publish(jsonMessage);
      print('✅ Notification request sent to queue successfully for token: $fcmToken');
      client.close();
    } catch (e) {
      print('❌ Error sending notification request to RabbitMQ: $e');
    }
  }


  // void upvotePost(int index) {
  //   setState(() {
  //     posts[index].upvotes++;
  //
  //   });
  // }
  Future<void> upvotePost(int index) async {
    final post = posts[index];

    setState(() {
      posts[index].upvotes++;
    });

    // Get FCM token for the post creator
    final fcmToken = await getFCMToken(post.userid);

    if (fcmToken != null) {
      // Send notification through RabbitMQ
      await sendPushNotification(
        fcmToken: fcmToken
      );
    }

    // try {
    //   final response = await http.post(
    //     Uri.parse('$apiUrl/${post.id}/upvote'),
    //     headers: {'Content-Type': 'application/json'},
    //   );
    //
    //   if (response.statusCode != 200) {
    //     // If server update fails, revert the optimistic update
    //     setState(() {
    //       posts[index].upvotes--;
    //     });
    //   }
    // } catch (e) {
    //   // If there's an error, revert the optimistic update
    //   setState(() {
    //     posts[index].upvotes--;
    //   });
    //   print('Error updating upvote: $e');
    // }
  }


  void downvotePost(int index) {
    setState(() {
      posts[index].downvotes++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 50,
        backgroundColor: Colors.white,
        title: const Text(
          'Your Feed',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart, color: Colors.black),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ShopPg()),
            ),
          ),
        ],
      ),
      backgroundColor: Colors.white,
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text('Error: $error'))
              : ListView.builder(
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    final post = posts[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 4,
                      child: InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PostDetailPage(post: post),
                            ),
                          );
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                post.imageUrl,
                                width: double.infinity,
                                height: 200,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    Container(
                                  height: 200,
                                  color: Colors.grey[300],
                                  child: const Center(
                                    child: Text('Image not available'),
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    post.title,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    post.content,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.arrow_upward,
                                                color: Colors.green),
                                            onPressed: () => upvotePost(index),
                                          ),
                                          Text('${post.upvotes}'),
                                          IconButton(
                                            icon: const Icon(
                                                Icons.arrow_downward,
                                                color: Colors.red),
                                            onPressed: () =>
                                                downvotePost(index),
                                          ),
                                          Text('${post.downvotes}'),
                                        ],
                                      ),
                                      Text(
                                        '${post.createdAt.toLocal().toString().split(' ')[0]}',
                                        style:
                                            const TextStyle(color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

class PostDetailPage extends StatelessWidget {
  final Post post;
  const PostDetailPage({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(post.title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(post.imageUrl,
                errorBuilder: (context, error, stackTrace) =>
                    Container(height: 200, color: Colors.grey)),
            const SizedBox(height: 16),
            Text(post.content, style: const TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
