import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const UPI_PA = 'ashutoshdp2003@okaxis';
const UPI_PN = 'AIMX%20Events';

function EventPayment({ event, className = '' }) {
  const qrRef = useRef(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  const upiUrl = event?.price > 0 
    ? `upi://pay?pa=${UPI_PA}&pn=${UPI_PN}&am=${event.price}&cu=INR`
    : '';

  useEffect(() => {
    if (event?.price > 0 && qrRef.current && !qrGenerated) {
      QRCode.toCanvas(qrRef.current, upiUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0D0D1A',
          light: '#FFFFFF'
        }
      }).then(() => setQrGenerated(true));
    }
  }, [event, upiUrl, qrGenerated]);

  if (!event) return null;

  return (
    <div className={`event-payment-section ${className}`}>
      <h4 className="event-payment-title">EVENT PAYMENT</h4>
      <div className="payment-info">
        <div className="payment-event">Event: {event.name}</div>
        <div className="payment-amount">Amount: ₹{event.price}</div>
      </div>
      
      {event.price > 0 ? (
        <>
          <div className="qr-wrapper">
            <canvas ref={qrRef} className="payment-qr" />
          </div>
          <div className="upi-info">
            <div className="upi-id">UPI ID: ashutoshdp2003@okaxis</div>
            <p className="scan-text">Scan to pay using any UPI app</p>
          </div>
          <img src="/assets/pay.jpeg" alt="Pay with UPI" className="pay-image" />
        </>
      ) : (
        <div className="free-event">
          <p className="free-text">This event is free. No payment required.</p>
        </div>
      )}
    </div>
  );
}

export default EventPayment;

