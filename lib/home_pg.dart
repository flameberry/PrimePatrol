import 'dart:async';

import 'package:flutter/material.dart';
import 'package:smartwater/shop_pg.dart';
import 'package:http/http.dart' as http;
import 'package:dart_amqp/dart_amqp.dart';
import 'dart:convert';

// const rabbitMqHost = '172.20.10.10'
// const rabbitMqHost = '10.0.2.2';
const rabbitMqHost = '192.168.1.38';
const rabbitMqPort = 5672;
const rabbitMqUser = 'guest';
const rabbitMqPass = 'guest';
const rabbitMqGeolocationQueueName = 'geolocation_queue';

class Post {
  final String id;
  final String title;
  final String content;
  final String imageUrl;
  final String? status;
  final DateTime createdAt;
  final String userId;
  int upvotes;
  int downvotes;
  double latitude;
  double longitude;

  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
    this.status,
    required this.userId,
    required this.createdAt,
    this.upvotes = 0,
    this.downvotes = 0,
    this.latitude = 0.0,
    this.longitude = 0.0,
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
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      userId: json['userId'] ?? '',
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
  Set<String> upvotedPosts = {}; // Track upvoted posts
  Set<String> downvotedPosts = {}; // Track downvoted posts
  final String apiUrl = "http://192.168.1.38:3000/posts";
  final String userApiUrl = "http://192.168.1.38:3000/users";

  @override
  void initState() {
    super.initState();
    fetchPosts();
  }

  Future<void> fetchPosts() async {
    try {
      // Step 1: Fetch all posts from the API
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        List<Post> allPosts = data.map((item) => Post.fromJson(item)).toList();
        List<Post> filteredPosts;

        const bool filterByLocation = false;

        if (filterByLocation) {
          // TODO: Fetch user latitude and longitude dynamically
          double userLatitude = 33.4; // Replace with actual location fetching
          double userLongitude = 100.3; // Replace with actual location fetching

          // Step 2: Prepare geolocation data
          Map<String, dynamic> geolocationData = {
            "radius_km": 4200.0, // Search radius from user location
            "baselocation": {
              "latitude": userLatitude.toDouble(),
              "longitude": userLongitude.toDouble()
            },
            "geolocations": allPosts
                .map((post) => {
                      "postId": post.id,
                      "latitude": post.latitude.toDouble(),
                      "longitude": post.longitude.toDouble(),
                    })
                .toList()
          };

          // Step 3: Send to RabbitMQ with Direct Reply-to
          List<String> validPostIds =
              await sendToGeolocationQueue(geolocationData);

          // Step 4: Filter posts based on received validPostIds
          filteredPosts =
              allPosts.where((post) => validPostIds.contains(post.id)).toList();
        } else {
          filteredPosts = allPosts;
        }

        setState(() {
          posts = filteredPosts; // Use filtered posts
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

  Future<List<String>> sendToGeolocationQueue(
      Map<String, dynamic> payload) async {
    final List<String> validPostIds = [];
    final completer = Completer<List<String>>();

    try {
      // Establish RabbitMQ connection
      Client client = Client(
          settings: ConnectionSettings(
              host: rabbitMqHost,
              port: rabbitMqPort,
              authProvider: PlainAuthenticator(rabbitMqUser, rabbitMqPass)));

      Channel channel = await client.channel();

      // **Using Direct Reply-To queue**
      String replyQueue = "amq.rabbitmq.reply-to";
      String correlationId = DateTime.now().millisecondsSinceEpoch.toString();

      Consumer consumer = await (await channel.queue(replyQueue)).consume();

      consumer.listen((AmqpMessage message) {
        if (message.properties?.corellationId == correlationId) {
          try {
            Map<String, dynamic> response = jsonDecode(message.payloadAsString);

            // Ensure validPostIds are converted to integers
            validPostIds.addAll((response["validPostIds"] as List<dynamic>)
                .map((id) => id.toString()));

            completer.complete(validPostIds);
            client.close(); // Close connection after receiving response
          } catch (e) {
            completer.completeError("Failed to parse RabbitMQ response: $e");
            print("❌ Message content: ${message.payloadAsString}");
          }
        }
      });

      // Publish message with Direct Reply-To
      Queue queue =
          await channel.queue(rabbitMqGeolocationQueueName, durable: true);
      queue.publish(jsonEncode(payload),
          properties: MessageProperties()
            ..corellationId = correlationId
            ..replyTo = replyQueue // **This is the correct way**
          );

      return completer.future;
    } catch (e) {
      print("❌ Error sending to RabbitMQ: $e");
      return [];
    }
  }

  Future<String?> getFCMToken(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$userApiUrl/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final Map<String,dynamic> usersData = json.decode(response.body);
        print('User Data Response: $usersData');

        // Check if we got any users back
        if (usersData.isNotEmpty) {
          return usersData['fcm_token'] as String?;
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

  Future<void> sendPushNotification({required String fcmToken}) async {
    try {
      final ConnectionSettings settings = ConnectionSettings(
        host: rabbitMqHost,
        port: rabbitMqPort,
        authProvider: PlainAuthenticator(rabbitMqUser, rabbitMqPass),
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

  Future<void> upvotePost(int index) async {
    final postId = posts[index].id;
    final puserId = posts[index].userId;

    setState(() {
      if (upvotedPosts.contains(postId)) {
        // If already upvoted, remove the upvote
        posts[index].upvotes--;
        upvotedPosts.remove(postId);
      } else {
        // If downvoted before, remove the downvote
        if (downvotedPosts.contains(postId)) {
          posts[index].downvotes--;
          downvotedPosts.remove(postId);
        }
        // Add upvote
        posts[index].upvotes++;
        upvotedPosts.add(postId);
      }
    });

    // Get FCM token for the post creator
    final fcmToken = await getFCMToken(puserId);

    if (fcmToken != null) {
      // Send notification through RabbitMQ
      await sendPushNotification(fcmToken: fcmToken);
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
    final postId = posts[index].id;

    setState(() {
      if (downvotedPosts.contains(postId)) {
        // If already downvoted, remove the downvote
        posts[index].downvotes--;
        downvotedPosts.remove(postId);
      } else {
        // If upvoted before, remove the upvote
        if (upvotedPosts.contains(postId)) {
          posts[index].upvotes--;
          upvotedPosts.remove(postId);
        }
        // Add downvote
        posts[index].downvotes++;
        downvotedPosts.add(postId);
      }
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
