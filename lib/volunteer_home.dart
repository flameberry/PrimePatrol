import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

class VolunteerHome extends StatefulWidget {
  @override
  _VolunteerHomeState createState() => _VolunteerHomeState();
}

class _VolunteerHomeState extends State<VolunteerHome> {
  // List of assigned posts
  List<Map<String, dynamic>> assignedPosts = [];
  bool isLoading = true;
  String? error;

  // Replace with your actual API URL
  final String apiUrl = "http://192.168.1.7:3000";

  @override
  void initState() {
    super.initState();
    fetchAssignedPosts();
  }

  // Fetch assigned posts for the worker
  Future<void> fetchAssignedPosts() async {
    try {
      // Step 1: Get the worker's ID (replace with actual logic to get worker ID)
      final String workerId =
          "67bf0cc82f33790d51443129"; // Replace with actual worker ID

      // Step 2: Fetch assigned posts from the API
      final response = await http.get(
        Uri.parse('$apiUrl/workers/$workerId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> workerData = json.decode(response.body);
        print('Worker Data: $workerData');

        // Step 3: Extract assigned posts
        final List<dynamic> posts = workerData['assignedPosts'] ?? [];
        List<Map<String, dynamic>> fetchedPosts = [];

        for (var post in posts) {
          try {
            // Make sure 'post' is a String (postId) before using it
            if (post is String) {
              final postResponse = await http.get(
                Uri.parse('$apiUrl/posts/$post'),
                headers: {'Content-Type': 'application/json'},
              );

              if (postResponse.statusCode == 200) {
                final postData = json.decode(postResponse.body);
                fetchedPosts.add(postData);
              } else {
                print(
                    'Failed to fetch post $post: ${postResponse.statusCode}'); // Use 'post' here
                // Handle error appropriately, e.g., add a placeholder
                fetchedPosts.add({
                  'postId': post, // Use 'post' here
                  'title': 'Error Loading',
                  'content': 'Could not load post details',
                  'imageUrl': '',
                  'status': 'Pending', // Add a default status
                });
              }
            } else {
              // If 'post' is already a map (not just a postId), add it directly
              fetchedPosts.add(post as Map<String, dynamic>);
            }
          } catch (e) {
            print('Error fetching post $post: $e'); // Use 'post' here
            fetchedPosts.add({
              'postId': post, // Use 'post' here
              'title': 'Error Loading',
              'content': 'Could not load post details',
              'imageUrl': '',
              'status': 'Pending', // Add a default status
            });
          }
        }

        setState(() {
          assignedPosts = fetchedPosts;
          isLoading = false;
        });
      } else {
        throw Exception(
            'Failed to fetch assigned posts: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching assigned posts: $e');
      setState(() {
        isLoading = false;
        error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 50,
        backgroundColor: Colors.grey[50],
        title: const Text(
          'Your Tasks',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      backgroundColor: Colors.grey[50],
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text('Error: $error'))
              : Column(
                  children: [
                    // Assigned posts list
                    Expanded(
                      child: ListView.builder(
                        itemCount: assignedPosts.length,
                        itemBuilder: (context, index) {
                          final post = assignedPosts[index];
                          return Card(
                            color: Color(0xFF2E66D7),
                            elevation: 3,
                            margin: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            child: ListTile(
                              leading: post['imageUrl'] != null &&
                                      post['imageUrl'].isNotEmpty
                                  ? Image.network(
                                      post['imageUrl'],
                                      width: 50,
                                      height: 50,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Icon(Icons.error),
                                    )
                                  : const Icon(Icons.image_not_supported),
                              title: Text(
                                post['title'] ?? 'Unknown Post',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(
                                post['content'] ?? 'No Description',
                                style: TextStyle(color: Colors.white),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              onTap: () {
                                // Navigate to post details page
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        PostDetailPage(post: post),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}

class PostDetailPage extends StatefulWidget {
  final Map<String, dynamic> post;

  const PostDetailPage({Key? key, required this.post}) : super(key: key);

  @override
  _PostDetailPageState createState() => _PostDetailPageState();
}

class _PostDetailPageState extends State<PostDetailPage> {
  List<dynamic> activities = [];
  bool _isLoading = false;
  final String apiUrl = "http://192.168.1.7:3000";

  @override
  void initState() {
    super.initState();
    fetchActivities();
  }

  Future<void> fetchActivities() async {
    setState(() {
      _isLoading = true;
    });
    try {
      // Check if we have a valid postId
      final postId = widget.post['_id'] ?? widget.post['postId'];

      if (postId == null) {
        throw Exception('No valid post ID found');
      }

      final response = await http.get(
        Uri.parse('${apiUrl}/posts/$postId/activities'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        setState(() {
          activities = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch activities: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching activities: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> logActivity(String? statusUpdate) async {
    // Make statusUpdate non-nullable
    if (statusUpdate == null || statusUpdate.isEmpty) {
      // Handle the case where statusUpdate is null or empty
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status update cannot be empty!')));
      return;
    }

    try {
      final String workerId =
          "67bf0cc82f33790d51443129"; // Replace with actual worker ID
      final postId = widget.post['_id'] ?? widget.post['postId'];

      if (postId == null) {
        throw Exception('No valid post ID found');
      }

      final response = await http.post(
        Uri.parse('${apiUrl}/posts/$postId/activities'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'action': statusUpdate, 'workerId': workerId}),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Activity logged successfully!')));
        fetchActivities(); // Refresh activities after logging
      } else {
        throw Exception('Failed to log activity: ${response.statusCode}');
      }
    } catch (e) {
      print('Error logging activity: $e');
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error logging activity')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.post['title'] ?? 'Post Details'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.post['imageUrl'] != null &&
                widget.post['imageUrl'].isNotEmpty)
              Image.network(
                widget.post['imageUrl'],
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 200,
                  color: Colors.grey[300],
                  child: const Center(
                    child: Text('Image not available'),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            Text(
              widget.post['content'] ?? 'No content',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            Text(
              'Status: ${widget.post['status'] ?? 'Unknown'}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            ElevatedButton(
              onPressed: () async {
                String? statusUpdate; // Declare statusUpdate outside

                statusUpdate = await showDialog<String>(
                  context: context,
                  builder: (BuildContext context) => AlertDialog(
                    title: const Text('Log Activity'),
                    content: TextField(
                      decoration:
                          InputDecoration(hintText: "Enter status update"),
                      onChanged: (value) {
                        statusUpdate = value;
                      },
                    ),
                    actions: <Widget>[
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context, statusUpdate),
                        child: const Text('Log'),
                      ),
                    ],
                  ),
                );

                if (statusUpdate != null) {
                  await logActivity(statusUpdate);
                }
              },
              child: const Text('Log Worker Activity'),
            ),
            const SizedBox(height: 20),
            Text(
              'Activity Log:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : activities.isEmpty
                    ? Text('No activities logged yet.')
                    : Expanded(
                        child: ListView.builder(
                          itemCount: activities.length,
                          itemBuilder: (context, index) {
                            final activity = activities[index];
                            return ListTile(
                              title: Text(activity['action'] ?? 'No Status'),
                              subtitle: Text(
                                  'Worker: ${activity['workerId'] ?? 'Unknown'}'),
                            );
                          },
                        ),
                      ),
          ],
        ),
      ),
    );
  }
}
