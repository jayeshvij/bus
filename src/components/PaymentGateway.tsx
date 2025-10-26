import React from 'react';
// This is the CORRECT way
import { QRCodeSVG as QRCode } from 'qrcode.react';import { QrCode } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  upiId: string;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, upiId }) => {
  const paymentLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Bus%20Transport%20Fee`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-green-600" />
        Payment Gateway
      </h3>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-800 mb-2">₹{amount}</div>
          <p className="text-sm text-gray-600">Scan QR code to pay via UPI</p>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg border-2 border-green-300">
            <QRCode value={paymentLink} size={200} />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
          <p className="text-sm font-semibold text-blue-600">{upiId}</p>
          <p className="text-xs text-gray-500 mt-3">Or manually enter UPI ID: {upiId}</p>
        </div>
      </div>
    </div>
  );
};

