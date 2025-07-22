<?php
// Asegúrate de que este script solo sea accesible por POST para evitar accesos directos
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// 1. Incluir el archivo de configuración con las credenciales
require_once '/config/config.php';

// 2. Cargar las clases de PHPMailer (asumiendo instalación vía Composer)
// Si no usas Composer, deberías hacer:
// require 'PHPMailer/src/PHPMailer.php';
// require 'PHPMailer/src/SMTP.php';
// require 'PHPMailer/src/Exception.php';
require '/vendor/autoload.php'; // Ajusta esta ruta si tu carpeta vendor no está al mismo nivel que php/

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Configurar cabeceras para respuesta JSON
header('Content-Type: application/json');

// 3. Obtener y sanear los datos del formulario
$name    = htmlspecialchars(trim($_POST['name'] ?? ''));
$email   = htmlspecialchars(trim($_POST['email'] ?? ''));
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''));
$message = htmlspecialchars(trim($_POST['message'] ?? ''));

// 4. Validación básica de los datos del formulario
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos del formulario.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Por favor, introduce una dirección de correo electrónico válida.']);
    exit;
}

// 5. Instancia de PHPMailer
$mail = new PHPMailer(true); // Habilita excepciones para un mejor manejo de errores

try {
    // 6. Configuración del servidor SMTP (usando las constantes del config.php)
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;

    // Determinar el tipo de encriptación de PHPMailer
    if (defined('SMTP_ENCRYPTION')) { // Asegúrate de que la constante exista
        if (SMTP_ENCRYPTION === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif (SMTP_ENCRYPTION === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } else {
            $mail->SMTPSecure = false; // Sin encriptación (NO RECOMENDADO para producción)
        }
    } else {
        // Fallback si SMTP_ENCRYPTION no está definida (o es incorrecta)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Predeterminado a SSL
    }

    $mail->Port       = SMTP_PORT;

    // Opcional: Configuración de depuración (DESACTIVAR EN PRODUCCIÓN)
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    // $mail->Debugoutput = 'html'; // Para ver la depuración en el navegador

    // 7. Configuración de remitente y destinatarios
    $mail->setFrom(SMTP_USERNAME, $name); // El correo "de" tu formulario, con el nombre del remitente
    $mail->addAddress('aberto.webdesign@gmail.com', 'Tamara Martinez Rozada'); // El correo A DONDE se enviará el mensaje
    $mail->addReplyTo($email, $name); // Para responder directamente al correo del remitente

    // 8. Contenido del correo
    $mail->isHTML(true); // Establece el formato de email a HTML
    $mail->Subject = 'Mensaje de Contacto: ' . $subject;

    $emailBody = "
        <html>
        <head>
            <title>Mensaje de Contacto de tu Web</title>
        </head>
        <body>
            <h2>Mensaje Recibido de tu Formulario de Contacto</h2>
            <p><strong>Nombre:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Asunto:</strong> {$subject}</p>
            <p><strong>Mensaje:</strong></p>
            <p>{$message}</p>
        </body>
        </html>
    ";
    $mail->Body    = $emailBody;
    $mail->AltBody = "Mensaje Recibido de tu Formulario de Contacto:\n\n"
                   . "Nombre: {$name}\n"
                   . "Email: {$email}\n"
                   . "Asunto: {$subject}\n"
                   . "Mensaje: {$message}\n";

    // 9. Enviar el correo
    $mail->send();
    echo json_encode(['success' => true, 'message' => '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.']);

} catch (Exception $e) {
    // 10. Manejo de errores
    // En un entorno de producción, es crucial NO mostrar el error de PHPMailer directamente al usuario.
    // En su lugar, registra el error y da un mensaje genérico.
    error_log("Error al enviar email: {$e->getMessage()} (PHPMailer: {$mail->ErrorInfo})");
    echo json_encode(['success' => false, 'message' => 'Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.']);
}
?>