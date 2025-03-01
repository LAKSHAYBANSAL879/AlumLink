import React, { useState } from 'react';
import { Container, Grid, Button, Card, Typography } from '@mui/material';
import {Carousel} from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HomePage = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'New York' },
    { id: 2, title: 'Product Manager', company: 'Innovate Inc.', location: 'San Francisco' },
    { id: 3, title: 'Data Scientist', company: 'DataWorks', location: 'Chicago' },
  ]);

  const [donations, setDonations] = useState([
    { id: 1, title: 'Scholarship Fund for Students', description: 'Help support the next generation of alumni with their education.' },
    { id: 2, title: 'Alumni Event Funding', description: 'Contribute towards organizing alumni meet-ups and events.' },
  ]);

  const testimonials = [
    { name: 'Sam Smith', role: 'Alumnus', feedback: 'Alumni Connect has allowed me to stay in touch with my peers and access opportunities.' },
    { name: 'Jessica Brown', role: 'Student', feedback: 'This app is an amazing tool for networking with alumni and finding job opportunities.' },
    { name: 'Tom Davis', role: 'Alumnus', feedback: 'It’s great to see how alumni are giving back to the community through job postings and donations.' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="relative bg-blue-600 text-white py-10">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?alumni')" }}></div>
        <Container className="relative z-10 text-center">
          <Typography variant="h3" className="font-bold text-4xl mb-4">The Power of Alumni Networks</Typography>
          <Typography variant="h5">Connecting alumni to foster growth, learning, and opportunities for all.</Typography>
        </Container>
      </div>

      {/* Testimonial Slider */}
      <div className="py-12">
        <Container>
          <Typography variant="h4" className="text-center mb-6">What Our Alumni and Students Say</Typography>
          <Carousel
            showThumbs={false}
            autoPlay={true}
            infiniteLoop={true}
            interval={4000}
            className="max-w-3xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="text-center px-4 py-6 bg-white rounded-lg shadow-lg">
                <Typography variant="h6" className="font-semibold">{testimonial.name}</Typography>
                <Typography variant="body2" color="textSecondary">{testimonial.role}</Typography>
                <p className="mt-4 text-lg italic">{testimonial.feedback}</p>
              </div>
            ))}
          </Carousel>
        </Container>
      </div>

      {/* Recent Job Postings */}
      <div className="py-12 bg-white">
        <Container>
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5">Recent Job Postings</Typography>
            <Button variant="outlined" href="/job-portal" color="primary">Show More</Button>
          </div>
          <Grid container spacing={4}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card className="p-4 shadow-lg">
                  <Typography variant="h6" className="font-semibold">{job.title}</Typography>
                  <Typography variant="body2" className="text-gray-600">{job.company}</Typography>
                  <Typography variant="body2" className="text-gray-500">{job.location}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Recent Donation Requests */}
      <div className="py-12 bg-gray-50">
        <Container>
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5">Recent Donation Requests</Typography>
            <Button variant="outlined" href="/donation-portal" color="primary">Show More</Button>
          </div>
          <Grid container spacing={4}>
            {donations.map((donation) => (
              <Grid item xs={12} sm={6} md={4} key={donation.id}>
                <Card className="p-4 shadow-lg">
                  <Typography variant="h6" className="font-semibold">{donation.title}</Typography>
                  <Typography variant="body2" className="text-gray-600">{donation.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Footer Section */}
      <div className="bg-blue-600 text-white text-center py-4">
        <Typography>&copy; 2025 Alumni Connect | All rights reserved</Typography>
      </div>
    </div>
  );
};

export default HomePage;
