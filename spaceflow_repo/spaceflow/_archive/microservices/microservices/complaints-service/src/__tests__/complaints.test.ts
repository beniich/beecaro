import request from 'supertest';
import { app } from '../index';
import { Complaint } from '../models/Complaint';
import jwt from 'jsonwebtoken';

const generateToken = (role = 'citizen') => {
  return jwt.sign({ id: '507f1f77bcf86cd799439011', role }, process.env.JWT_SECRET || 'secret');
};

describe('Complaints API', () => {
  const validComplaint = {
    title: 'Nid de poule Rue de la Paix',
    description: 'Il y a un grand nid de poule.',
    category: 'Voirie',
    subcategory: 'Nid de poule',
    address: '10 Rue de la Paix',
    city: 'Paris',
    district: '75002',
    priority: 'high'
  };

  describe('POST /api/complaints', () => {
    it('should create a complaint successfully', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .send(validComplaint)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.number).toMatch(/^REC-\d{4}-\d{5}$/);
      expect(response.body.status).toBe('nouvelle');
      
      const inDb = await Complaint.findById(response.body._id);
      expect(inDb).not.toBeNull();
      expect(inDb?.timeline[0].eventType).toBe('created');
    });

    it('should fail validation without missing fields', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .send({ title: 'Manque adresse' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/complaints', () => {
    it('should list complaints with pagination', async () => {
      await Complaint.create(validComplaint);
      await Complaint.create({ ...validComplaint, title: 'Test 2' });

      const token = generateToken('dispatcher');
      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should deny access without auth token', async () => {
      await request(app).get('/api/complaints').expect(401);
    });
  });

  describe('PATCH /api/complaints/:id/status', () => {
    let complaintId: string;

    beforeEach(async () => {
      const created = await Complaint.create(validComplaint);
      complaintId = created._id.toString();
    });

    it('should update status if role is dispatcher', async () => {
      const token = generateToken('dispatcher');
      
      const response = await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'en cours', reason: 'Prise en charge' })
        .expect(200);

      expect(response.body.status).toBe('en cours');
      
      const updated = await Complaint.findById(complaintId);
      expect(updated?.timeline).toHaveLength(2); // created + status change
      expect(updated?.timeline[1].eventType).toBe('status_changed');
    });

    it('should fail if role is citizen', async () => {
      const token = generateToken('citizen');
      
      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'en cours' })
        .expect(403);
    });

    it('should reject invalid state transitions', async () => {
      const token = generateToken('admin');
      
      // "nouvelle" cannot go directly to "fermée"
      const response = await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'fermée' })
        .expect(400);
      
      expect(response.body.message).toMatch(/Transition invalide/);
    });
  });
});
