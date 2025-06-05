import React, { useState, useRef } from 'react';
import { DoctorAutocomplete, type Doctor } from './DoctorAutocomplete';

interface FormData {
  doctorName: string;
  credential: string;
  specialty: string;
  location: string;
  practiceName: string;
  phone: string;
  address: string;
  npi: string;
  productName: string;
  verifiedWebsite?: string;
}

interface MagicResearchFormProps {
  onSubmit: (data: FormData) => void;
  productName?: string;
}

export const MagicResearchForm: React.FC<MagicResearchFormProps> = ({ 
  onSubmit,
  productName = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    doctorName: '',
    credential: '',
    specialty: '',
    location: '',
    practiceName: '',
    phone: '',
    address: '',
    npi: '',
    productName: productName
  });

  const formRefs = {
    credential: useRef<HTMLInputElement>(null),
    specialty: useRef<HTMLInputElement>(null),
    location: useRef<HTMLInputElement>(null),
    practiceName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
  };

  // Magical field population with animations
  const magicallyPopulateFields = async (doctor: Doctor) => {
    const fields = [
      { key: 'doctorName', value: `${doctor.firstName} ${doctor.lastName}`, ref: null },
      { key: 'credential', value: doctor.credential || '', ref: formRefs.credential },
      { key: 'specialty', value: doctor.specialty, ref: formRefs.specialty },
      { key: 'location', value: `${doctor.city}, ${doctor.state}`, ref: formRefs.location },
      { key: 'practiceName', value: doctor.organizationName || '', ref: formRefs.practiceName },
      { key: 'phone', value: doctor.phone || '', ref: formRefs.phone },
      { key: 'address', value: doctor.fullAddress, ref: formRefs.address },
    ];

    // Stagger the animations for maximum "holy shit" effect
    for (let i = 0; i < fields.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 * i));
      
      const field = fields[i];
      setFormData(prev => ({ ...prev, [field.key]: field.value }));
      
      // Animate the field
      if (field.ref?.current) {
        field.ref.current.style.transition = 'all 0.3s ease';
        field.ref.current.style.backgroundColor = '#3b82f6';
        field.ref.current.style.color = 'white';
        field.ref.current.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
          if (field.ref?.current) {
            field.ref.current.style.backgroundColor = '#dbeafe';
            field.ref.current.style.color = '#1f2937';
            field.ref.current.style.transform = 'scale(1)';
          }
        }, 300);
        
        setTimeout(() => {
          if (field.ref?.current) {
            field.ref.current.style.backgroundColor = '';
          }
        }, 600);
      }
    }

    // Store NPI for verification
    setFormData(prev => ({ ...prev, npi: doctor.npi }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Research Doctor</h2>
        <p className="text-gray-600 mt-2">Just start typing...</p>
      </div>

      {/* The Magic Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Doctor Search
        </label>
        <DoctorAutocomplete 
          onSelect={magicallyPopulateFields}
          inputClassName="text-lg"
        />
      </div>

      {/* Fields that magically populate */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credential
          </label>
          <input
            ref={formRefs.credential}
            type="text"
            value={formData.credential}
            onChange={(e) => setFormData({...formData, credential: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialty
          </label>
          <input
            ref={formRefs.specialty}
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            ref={formRefs.location}
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Practice Name
          </label>
          <input
            ref={formRefs.practiceName}
            type="text"
            value={formData.practiceName}
            onChange={(e) => setFormData({...formData, practiceName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            ref={formRefs.phone}
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            ref={formRefs.address}
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product/Service
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData({...formData, productName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="What are you selling?"
          />
        </div>
      </div>

      {formData.npi && (
        <div className="text-xs text-gray-500 text-center">
          NPI: {formData.npi} • Verified Healthcare Provider ✓
        </div>
      )}

      <button
        type="submit"
        disabled={!formData.doctorName || !formData.productName}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Start Intelligence Scan
      </button>
    </form>
  );
};