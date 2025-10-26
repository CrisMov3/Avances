<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- CONFIGURACIÓN DE WOMPI ---
$WOMPI_PRIVATE_KEY = "prv_test_4PtwNcCtxxVYywvQ4Prr5cyf4szxxQmQ"; 
$WOMPI_API_URL = "https://api-sandbox.wompi.co/v1/payment_links";

$response = ['success' => false, 'message' => 'Error desconocido.'];
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    $response['message'] = 'No se recibieron datos (JSON nulo).';
    echo json_encode($response);
    exit;
}

$amount = $data['amount'] ?? 0;
$reference = $data['reference'] ?? 'PAGO-STROKBIG-' . time();
$customerName = $data['customerName'] ?? 'Cliente Strokbig';
$description = $data['description'] ?? 'Pago de servicios';
$redirectUrl = $data['redirectUrl'] ?? 'http://localhost/strokbig/pagos.html'; 

if ($amount <= 0) {
    $response['message'] = 'El monto debe ser mayor a cero.';
    echo json_encode($response);
    exit;
}

$amount_in_cents = (int)($amount * 100);

$wompi_data = [
    'name' => "Pago para: $customerName",
    'description' => $description,
    'single_use' => true,      
    'collect_shipping' => false, 
    'amount_in_cents' => $amount_in_cents,
    'currency' => 'COP',
    'reference' => $reference,
    // --- INICIO DE LA MODIFICACIÓN ---
    // Añadimos un parámetro a la URL de redirección
    'redirect_url' => $redirectUrl . '?wompi_return=true' 
    // --- FIN DE LA MODIFICACIÓN ---
];

$ch = curl_init($WOMPI_API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($wompi_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $WOMPI_PRIVATE_KEY
]);

$wompi_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$wompi_result = json_decode($wompi_response, true);

if ($http_code == 201 && isset($wompi_result['data']['id'])) {
    $response['success'] = true;
    $response['message'] = 'Link de pago creado.';
    $response['linkId'] = $wompi_result['data']['id']; 
} else {
    $response['message'] = 'Error al crear el link de pago con Wompi.';
    $response['wompi_error'] = $wompi_result['error'] ?? 'Error desconocido de Wompi'; 
}

echo json_encode($response);
?>