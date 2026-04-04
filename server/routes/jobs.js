const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const { auth, requireProvider, requireSeeker } = require('../middleware/auth');

router.get('/my/listings', auth, requireProvider, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/my/applications', auth, requireSeeker, async (req, res) => {
  try {
    const applications = await JobApplication.find({ seeker: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/my/incoming-applications', auth, requireProvider, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).select('_id');
    const jobIds = jobs.map((j) => j._id);
    const applications = await JobApplication.find({ job: { $in: jobIds } })
      .populate('job')
      .populate('seeker', 'name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'open';
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }
    const jobs = await Job.find(filter)
      .populate('employer', 'name')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id/applications', auth, requireProvider, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const applications = await JobApplication.find({ job: jobId })
      .populate('seeker', 'name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findById(jobId).populate('employer', 'name');
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, requireProvider, async (req, res) => {
  try {
    const { title, description, category, pay, location, companyName } = req.body;
    if (!title || !category || !pay || !location) {
      return res.status(400).json({ msg: 'Title, category, pay, and location are required' });
    }
    const user = await User.findById(req.user.id);
    const job = new Job({
      title,
      description: description || '',
      category,
      pay,
      location,
      companyName: companyName || user.name,
      employer: req.user.id,
    });
    await job.save();
    const populated = await Job.findById(job._id).populate('employer', 'name');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, requireProvider, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { title, description, category, pay, location, companyName, status } = req.body;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (category !== undefined) job.category = category;
    if (pay !== undefined) job.pay = pay;
    if (location !== undefined) job.location = location;
    if (companyName !== undefined) job.companyName = companyName;
    if (status !== undefined && ['open', 'closed'].includes(status)) job.status = status;
    await job.save();
    const populated = await Job.findById(job._id).populate('employer', 'name');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, requireProvider, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    await JobApplication.deleteMany({ job: jobId });
    await Job.findByIdAndDelete(jobId);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/apply', auth, requireSeeker, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.status !== 'open') {
      return res.status(400).json({ msg: 'This job is no longer accepting applications' });
    }
    if (job.employer.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot apply to your own job' });
    }
    const existing = await JobApplication.findOne({ job: jobId, seeker: req.user.id });
    if (existing) {
      return res.status(400).json({ msg: 'You have already applied to this job' });
    }
    const { message } = req.body;
    const application = new JobApplication({
      job: jobId,
      seeker: req.user.id,
      message: message || '',
    });
    await application.save();
    const populated = await JobApplication.findById(application._id)
      .populate('job')
      .populate('seeker', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'You have already applied to this job' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.patch('/applications/:applicationId', auth, requireProvider, async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ msg: 'Invalid application id' });
    }
    const application = await JobApplication.findById(applicationId).populate('job');
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { status } = req.body;
    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Valid status required' });
    }
    application.status = status;
    await application.save();
    const populated = await JobApplication.findById(application._id)
      .populate('job')
      .populate('seeker', 'name');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
