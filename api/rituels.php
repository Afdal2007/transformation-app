<?php
require '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $conn->prepare('INSERT INTO rituels (domaine_id, description, moment, date_ritual) VALUES (?, ?, ?, ?)');
  $stmt->bind_param('isss', $data['domaine_id'], $data['description'], $data['moment'], $data['date']);
  $stmt->execute();
  echo json_encode(['id' => $conn->insert_id, 'success' => true]);
  $stmt->close();
}

if ($method === 'GET') {
  $result = $conn->query('SELECT r.*, d.nom FROM rituels r JOIN domaines d ON r.domaine_id = d.id ORDER BY r.date_ritual DESC');
  echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

if ($method === 'PUT') {
  $data = json_decode(file_get_contents('php://input'), true);
  $stmt = $conn->prepare('UPDATE rituels SET completed = ? WHERE id = ?');
  $stmt->bind_param('ii', $data['completed'], $data['id']);
  $stmt->execute();
  echo json_encode(['success' => true]);
  $stmt->close();
}
?>