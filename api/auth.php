<?php
require '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'register') {
  $data = json_decode(file_get_contents('php://input'), true);
  $user = $data['username'];
  $email = $data['email'];
  $pass = password_hash($data['password'], PASSWORD_BCRYPT);
  
  $stmt = $conn->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
  $stmt->bind_param('sss', $user, $email, $pass);
  
  if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
  } else {
    echo json_encode(['error' => 'Utilisateur existe déjà']);
  }
  $stmt->close();
}

if ($method === 'POST' && $action === 'login') {
  $data = json_decode(file_get_contents('php://input'), true);
  $user = $data['username'];
  
  $result = $conn->query("SELECT id, password FROM users WHERE username = '$user'");
  $row = $result->fetch_assoc();
  
  if ($row && password_verify($data['password'], $row['password'])) {
    echo json_encode(['success' => true, 'id' => $row['id']]);
  } else {
    echo json_encode(['error' => 'Identifiants incorrects']);
  }
}
?>