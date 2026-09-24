<?php
require 'config.php';

$sql = "
CREATE TABLE IF NOT EXISTS domaines (
  id INT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO domaines VALUES 
(1, 'Corps Physique & Énergie'),
(2, 'Bonheur & Récréation'),
(3, 'Développement Personnel'),
(4, 'Relations Sociales'),
(5, 'Relation Conjugale'),
(6, 'Carrière & Profession');

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domaine_id INT NOT NULL,
  score INT CHECK (score >= 1 AND score <= 5),
  date_eval DATE DEFAULT CURDATE(),
  FOREIGN KEY (domaine_id) REFERENCES domaines(id)
);

CREATE TABLE IF NOT EXISTS rituels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domaine_id INT NOT NULL,
  description VARCHAR(255),
  moment ENUM('matin', 'jour', 'soir'),
  date_ritual DATE DEFAULT CURDATE(),
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (domaine_id) REFERENCES domaines(id)
);
";

$queries = explode(';', $sql);
foreach ($queries as $query) {
  if (trim($query)) {
    $conn->query($query);
  }
}

echo "✅ Tables créées !";
?>