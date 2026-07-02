const PDFDocument = require('pdfkit');

class TicketService {
  generateTicketPDF(booking, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // 1. Header
        doc.fontSize(25).font('Helvetica-Bold').text('BusBook E-Ticket', { align: 'center' });
        doc.moveDown();
        
        // 2. Booking Info
        doc.fontSize(12).font('Helvetica-Bold').text('Booking Reference:', { continued: true }).font('Helvetica').text(` BKG-${booking.id}`);
        doc.font('Helvetica-Bold').text('Date Booked:', { continued: true }).font('Helvetica').text(` ${new Date(booking.createdAt).toLocaleDateString()}`);
        doc.moveDown();

        // 3. Passenger Info
        doc.rect(50, doc.y, 500, 20).fillAndStroke('#f3f4f6', '#d1d5db');
        doc.fillColor('#000').font('Helvetica-Bold').text('Passenger Details', 60, doc.y + 5);
        doc.moveDown(1.5);
        doc.font('Helvetica-Bold').text('Name:', 50, doc.y, { continued: true }).font('Helvetica').text(` ${user.name}`);
        doc.font('Helvetica-Bold').text('Email:', { continued: true }).font('Helvetica').text(` ${user.email}`);
        doc.moveDown();

        // 4. Trip Info
        doc.rect(50, doc.y, 500, 20).fillAndStroke('#e0e7ff', '#a5b4fc');
        doc.fillColor('#000').font('Helvetica-Bold').text('Journey Details', 60, doc.y + 5);
        doc.moveDown(1.5);

        const trip = booking.trip;
        const origin = trip.bus.route[0]; // Simplified for now
        const dest = trip.bus.route[trip.bus.route.length - 1]; // Simplified for now
        
        doc.font('Helvetica-Bold').text('Bus Number:', 50, doc.y, { continued: true }).font('Helvetica').text(` ${trip.bus.busNumber}`);
        doc.font('Helvetica-Bold').text('Journey Date:', { continued: true }).font('Helvetica').text(` ${trip.date}`);
        doc.font('Helvetica-Bold').text('Departure Time:', { continued: true }).font('Helvetica').text(` ${trip.departureTime}`);
        doc.font('Helvetica-Bold').text('Arrival Time:', { continued: true }).font('Helvetica').text(` ${trip.estimatedArrivalTime}`);
        
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Route:', { continued: true }).font('Helvetica').text(` ${origin} to ${dest}`);
        doc.moveDown();

        // 5. Seats & Payment
        doc.rect(50, doc.y, 500, 20).fillAndStroke('#fcfdfd', '#d1d5db');
        doc.fillColor('#000').font('Helvetica-Bold').text('Payment Summary', 60, doc.y + 5);
        doc.moveDown(1.5);
        
        doc.font('Helvetica-Bold').text('Selected Seats:', 50, doc.y, { continued: true }).font('Helvetica').text(` ${booking.seatNumbers.join(', ')}`);
        doc.font('Helvetica-Bold').text('Total Amount Paid:', { continued: true }).font('Helvetica').text(` Rs. ${booking.totalAmount}`);
        
        doc.moveDown(2);
        
        // 6. Footer
        doc.fontSize(10).font('Helvetica-Oblique').text('Please carry a valid ID proof during the journey. Have a safe trip!', { align: 'center', color: 'gray' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new TicketService();
