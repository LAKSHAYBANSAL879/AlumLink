import React, { useContext, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkle, ArrowRight, BookmarkPlus, MapPin, ReceiptIndianRupee } from 'lucide-react';
import { Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../userContext';

export default function JobsPage() {
  const [currentTab, setCurrentTab] = useState('All');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  const {user}=useContext(UserContext);
  const currentDate = new Date();
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/jobs/all'); 
        setJobsData(response.data);
      } catch (error) {
        console.error('Error fetching job data:', error);
      }
    };

    fetchJobs();
  }, []);
const navigate=useNavigate();
  const handleJobClick = (job) => {
navigate(`/jobDesc/${job._id}`)
  };


  const categories = ['All', 'Design', 'Development', 'Product Management', 'Marketing'];
  const filteredJobs = jobsData.filter(job => 
    (currentTab === 'All' || job.category === currentTab)&& (job.location.includes(selectedLocation) || selectedLocation==='') && (job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
    job.postedBy._id !== user._id && 
    (!job.appliedDate || new Date(job.appliedDate) >= currentDate)); // Exclude expired);

    const handleScroll = (direction) => {
      const cardWidth = 36.84 + 6;
      const maxScroll = Math.ceil(filteredJobs.length - (100 / cardWidth)); 
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - 1)
        : Math.min(maxScroll, scrollPosition + 1);
      setScrollPosition(newPosition);
    };
  const handleTabChange = (newValue) => {
    setCurrentTab(newValue);
    setScrollPosition(0);
  };

  const toggleSaveJob = (job) => {
    if (savedJobs.includes(job.id)) {
      setSavedJobs(savedJobs.filter(id => id !== job.id));
    } else {
      setSavedJobs([...savedJobs, job.id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
       
      <div className="bg-blue-600 rounded-xl p-8 mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex flex-row justify-center items-center">Find the right job  <Sparkle className='text-yellow-500 fill-yellow-500 w-24 h-12'/></h1>
        <h2 className="text-2xl text-white/90 mb-6 flex flex-row justify-center items-center font-semibold"><Sparkle className='text-yellow-500 fill-yellow-500 -mt-2 w-8 h-12'/> Perfectly suited for you</h2>
        
        <div className="flex bg-white rounded-full overflow-hidden p-2">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Job title or keyword"
              className="w-full outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-40 border-l">
            <select
              className="w-full h-full px-4 outline-none"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Location</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Noida">Noida</option>

            </select>
          </div>
          <button className="bg-lime-400 hover:bg-lime-500 text-blue-900 px-8 rounded-full">
            <ArrowRight/>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-64">
          <Tabs
            orientation="vertical"
            value={currentTab}
            onChange={(_, newValue) => handleTabChange(newValue)}
            className="bg-white rounded-xl p-4"
            TabIndicatorProps={{
              sx: {
                left: 0, 
                width: '4px',
                backgroundColor: 'primary.main', 
              },
            }}
            sx={{
              borderLeft: '4px solid gray-100', 
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category}
                value={category}
                label={category}
                sx={{
                  justifyContent: 'flex-end', 
                  textAlign: 'end',
                }}
              />
            ))}
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex justify-end mb-4 gap-2 overflow-hidden">
            <button 
              onClick={() => handleScroll('left')}
              className="text-white bg-gray-900 hover:bg-gray-700 rounded-full p-2"
              disabled={scrollPosition === 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="text-white bg-gray-900 hover:bg-gray-700 rounded-full p-2"
              disabled={scrollPosition >= Math.max(0, filteredJobs.length - 2)}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${scrollPosition * 36.84}%)` }}
            >
              {filteredJobs.map((job) => (
                <div 
                  key={job._id}
                  className="w-fit bg-white p-6 rounded-xl border hover:shadow-lg transition-all relative hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  {/* <button
                    onClick={() => toggleSaveJob(job)}
                    className={`absolute top-2 right-2 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors ${savedJobs.includes(job.id) ? 'text-blue-500' : 'text-gray-500'}`}
                  >
                    <BookmarkPlus className="w-6 h-6" />
                  </button> */}
                  <div className="mb-4 text-left">
                    <div className='text-left align-center flex flex-col justify-items-start'>
                      <h4 className="text-xl font-semibold mb-2">{job.title}</h4>
                      <div className='flex w-auto'>
                        <h1 className="text-gray-900 px-3 py-1 rounded-full text-base bg-blue-200">
                          {job.category}
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-row w-full">
                    <h1 className="text-gray-900 px-3 py-1 rounded-full text-sm flex align-middle gap-1 items-center flex-row  justify-between w-fit">
                      <MapPin className='text-base h-6 w-6'/> <span className='truncate'>{job.location.join(', ')}</span>
                    </h1>
                    <h1 className="text-gray-900 px-3 py-1 rounded-full text-sm flex flex-row align-middle gap-1 items-center">
                      <ReceiptIndianRupee className='text-base h-6 w-6'/> <span className='truncate'>{job.salaryRange}</span>
                    </h1>
                  </div>
                  <div className="mt-4 text-sm flex items-center text-gray-800">
                    <span className="flex-1 border-t border-gray-400 border-dashed"></span>
                    <span className="ml-4 font-medium text-gray-600">{job.posted}</span>
                  </div>
                  <div className='flex flex-row mt-2 gap-4'>
                    <div>
                    <img  
  src={job?.companyImageUrl 
    ? `${job.companyImageUrl}` 
    : 'https://tse2.mm.bing.net/th?id=OIP.qW3gSMjOUOxIxsdMw3fHVgHaHk&pid=Api&P=0&h=180'} 
  alt="Company Logo" 
  className='w-12 h-12 object-cover rounded-full'
/>

                      
                     
                    </div>
                    <div className='flex flex-col align-left text-left '>
                      <h1 className='text-gray-600 font-semibold text-lg'>{job.company}</h1>
                      <h1 className='text-gray-600 text-sm '>100+ employees</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}