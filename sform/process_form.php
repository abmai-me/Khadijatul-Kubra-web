<?php
// Include the PHPMailer class
require 'path/to/PHPMailer/PHPMailerAutoload.php';
require 'path/to/fpdf/fpdf.php'; // Include FPDF library for PDF generation

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $student_name = $_POST['student_name'];
    $dob = $_POST['dob'];
    $gender = $_POST['gender'];
    $session = $_POST['session'];
    $father_name = $_POST['father_name'];
    $mother_name = $_POST['mother_name'];
    $mobile1 = $_POST['mobile1'];
    $email = $_POST['email'];
    // Add more form data as needed...

    // Generate PDF
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16);

    // Title
    $pdf->Cell(200, 10, "Student Application Form", 0, 1, 'C');

    // Add form details to the PDF
    $pdf->SetFont('Arial', '', 12);
    $pdf->Ln(10); // Line break
    $pdf->Cell(50, 10, "Student Name: $student_name");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Date of Birth: $dob");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Gender: $gender");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Session: $session");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Father's Name: $father_name");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Mother's Name: $mother_name");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Mobile: $mobile1");
    $pdf->Ln();
    $pdf->Cell(50, 10, "Email: $email");
    $pdf->Ln();

    // Save the PDF to a file
    $pdf_file = 'student_application.pdf';
    $pdf->Output('F', $pdf_file);

    // Send the email with the PDF attachment
    $mail = new PHPMailer();
    $mail->isSMTP();
    $mail->Host = 'smtpout.secureserver.net'; // GoDaddy SMTP server
    $mail->SMTPAuth = true;
    $mail->Username = 'info@khadijatulkubratrust.org'; // Your GoDaddy email
    $mail->Password = 'Leicesteruk2024'; // Your GoDaddy email password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587; // SMTP port for TLS

    $mail->setFrom('your-email@yourdomain.com', 'Your Name');
    $mail->addAddress('parent-email@example.com'); // Parent's email address
    $mail->addAddress('khadijatulkubratrustuk@gmail.com'); // Trust's email address
    $mail->Subject = 'Student Application Form Submission';
    $mail->Body    = 'Attached is the student application form.';

    // Attach the PDF file
    $mail->addAttachment($pdf_file);

    // Send email and check for success
    if ($mail->send()) {
        echo 'Form submitted successfully, and PDF has been sent.';
    } else {
        echo 'Error: ' . $mail->ErrorInfo;
    }

    // Optional: Delete the PDF after sending the email
    unlink($pdf_file);
}
?>
