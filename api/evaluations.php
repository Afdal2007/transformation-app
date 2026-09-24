<?php
require '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  $stmt = $conn->prepare('INSERT INTO evaluations (domaine_id, score, date_eval) VALUES (?, ?, ?)');
  $stmt->bind_param('iis', $data['domaine_id'], $data['score'], $data['date']);
  $stmt->execute();
  
  echo json_encode(['id' => $conn->insert_id, 'success' => true]);
  $stmt->close();
}

if ($method === 'GET') {
  $result = $conn->query('SELECT e.id, e.domaine_id, e.score, e.date_eval, d.nom FROM evaluations e JOIN domaines d ON e.domaine_id = d.id ORDER BY e.date_eval DESC');
  echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}
?>