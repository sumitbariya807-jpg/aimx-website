import { useState, useEffect, useRef } from 'react';

const UPI_PA = 'ashutoshdp2003@okaxis';
const UPI_PN = 'AIMX%20Events';

function PaymentModal({ event, isOpen, onClose, onPaymentComplete }) {
  const [paymentStep, setPaymentStep] = useState('qr'); // 'qr' | 'verify'
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const qrRef = useRef(null);

  const upiUrl = event.price > 0 
    ? `upi://pay?pa=${UPI_PA}&pn=${UPI_PN}&am=${event.price}&cu=INR`
    : '';

  useEffect(() => {
    if (isOpen && event.price > 0 && qrRef.current && paymentStep === 'qr') {
      QRCode.toCanvas(qrRef.current, upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0D0D1A',
          light: '#FFFFFF'
        }
      });
    }
  }, [isOpen, upiUrl, paymentStep]);

  const handlePaymentDone = () => {
    if (event.price === 0) {
      onPaymentComplete({ event, transactionId: 'FREE' });
    } else {
      setPaymentStep('verify');
    }
  };

  const handleScreenshot = (file) => {
    if (file.size > 5 * 1024 * 1024) return alert('File < 5MB');
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = () => {
    if (!transactionId || transactionId.length !== 12) return alert('12 digit txn ID');
    if (!screenshot) return alert('Upload screenshot');
    onPaymentComplete({ event, transactionId, screenshot: screenshotPreview });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title" style={{color: "white", fontSize: "2rem"}}>{event.name}</h2>
        
        {paymentStep === 'qr' ? (
          <div className="payment-qr-section">
            <div className="event-price-display">₹{event.price}</div>
            <p className="upi-id">ashutoshdp2003@okaxis</p>
            <div className="qr-container">
              <canvas ref={qrRef} />
            </div>
            <img src="/assets/pay.jpeg" alt="Pay with UPI" className="pay-image" />
            <p className="scan-text">Scan to pay using any UPI app</p>
            <button className="btn btn-primary" onClick={handlePaymentDone}>
              {event.price === 0 ? 'Continue to Registration' : 'Payment Done'}
            </button>
          </div>
        ) : (
          <div className="payment-verify-section">
            <h3 style={{color: "white", fontSize: "1.8rem"}}>Verify Payment</h3>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 12-digit Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, '').slice(0,12))}
              maxLength={12}
            />
            <div className="upload-dropbox" onClick={() => document.getElementById('screenshotInput').click()}>
              {screenshotPreview ? (
                <img src={screenshotPreview} alt="Screenshot" className="preview-image" />
              ) : (
                <p>Upload Payment Screenshot</p>
              )}
              <input id="screenshotInput" type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => handleScreenshot(e.target.files[0])} />
            </div>
            <div className="modal-buttons">
              <button className="btn" onClick={() => setPaymentStep('qr')}>Back</button>
              <button className="btn btn-primary" onClick={handleSubmitPayment}>Submit Registration</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;

