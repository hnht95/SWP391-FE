import React from "react";

const ContactInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 h-full">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact information</h2>
      <ul className="space-y-4 mb-8">
        <li>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium text-gray-900">Zami EV Rentals, 136/15 Trần Quang Diệu, Phường Nhiu Lộc, HCMC</p>
        </li>
        <li>
          <p className="text-sm text-gray-500">Phone</p>
          <a href="tel:+84987654321" className="font-medium text-gray-900 hover:underline">
            +84 815142005
          </a>
        </li>
        <li>
          <p className="text-sm text-gray-500">Email</p>
          <a href="mailto:support@zami.vn" className="font-medium text-gray-900 hover:underline">
            support@zami.vn
          </a>
        </li>
      </ul>

      <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
        <iframe
          title="Zami EV Rentals Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.459328732084!2d106.70042387603364!3d10.776889259165662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f57b0b7f7%3A0x8c1a8c0a8c0a8c0a!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2svi!4v1700000000000!5m2!1sen!2svi"
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default ContactInfo;


