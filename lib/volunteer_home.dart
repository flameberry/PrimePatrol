import 'package:flutter/material.dart';

class VolunteerHome extends StatefulWidget {
  @override
  _VolunteerHomeState createState() => _VolunteerHomeState();
}

class _VolunteerHomeState extends State<VolunteerHome> {
  // List of ongoing tasks
  List<Map<String, dynamic>> tasks = [
    {'title': 'Distribute Water Bottles', 'status': 'Pending'},
    {'title': 'Monitor Water Usage', 'status': 'Pending'},
    {'title': 'Report Leakages', 'status': 'Pending'},
  ];

  // List of completed tasks
  List<Map<String, dynamic>> completedTasks = [];

  // Function to move accepted tasks to completed list
  void moveToCompleted(int index) {
    setState(() {
      completedTasks.add(tasks[index]); // Move task to completed list
      tasks.removeAt(index); // Remove from ongoing list
    });
  }

  // Function to remove rejected tasks
  void removeTask(int index) {
    setState(() {
      tasks.removeAt(index); // Remove from list immediately
    });
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
      body: Column(
        children: [
          // Ongoing tasks list
          Expanded(
            child: ListView.builder(
              itemCount: tasks.length,
              itemBuilder: (context, index) {
                return Dismissible(
                  key: Key(tasks[index]['title']),
                  background: Container(
                    color: Colors.green,
                    alignment: Alignment.centerLeft,
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: Icon(Icons.check, color: Colors.white, size: 30),
                  ),
                  secondaryBackground: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: Icon(Icons.close, color: Colors.white, size: 30),
                  ),
                  onDismissed: (direction) {
                    if (direction == DismissDirection.startToEnd) {
                      // Task accepted
                      moveToCompleted(index);
                    } else {
                      // Task rejected
                      removeTask(index);
                    }
                  },
                  child: Card(
                    color: Color(0xFF2E66D7),
                    elevation: 3,
                    margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: ListTile(
                      title: Text(
                        tasks[index]['title'],
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(
                        'Status: ${tasks[index]['status']}',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Display completed tasks in a table
          if (completedTasks.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Completed Tasks',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  DataTable(
                    columns: const [
                      DataColumn(label: Text('Title')),
                      DataColumn(label: Text('Status')),
                    ],
                    rows: completedTasks
                        .map(
                          (task) => DataRow(cells: [
                            DataCell(Text(task['title'])),
                            DataCell(Text('Completed')),
                          ]),
                        )
                        .toList(),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
