
<?php
// config/config.php (o email_config.php)

// Credenciales de SMTP para PHPMailer
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_USERNAME', 'contacto@aberto.es');
define('SMTP_PASSWORD', 't>K^S709'); // ¡CAMBIA ESTO!
define('SMTP_PORT', 465); // O 587 si usas STARTTLS
define('SMTP_ENCRYPTION', 'ssl'); // 'ssl' para 465, 'tls' para 587
// Para PHPMailer, 'ssl' corresponde a PHPMailer::ENCRYPTION_SMTPS
// y 'tls' corresponde a PHPMailer::ENCRYPTION_STARTTLS
?>