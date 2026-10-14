import React from 'react';

import { Link } from 'react-router-dom';
import AllModuleBarChart from "./Dashboard/AllModuleDataChart";

function AdminNavigation() {
  return (
    <section className="text-teal-600 body-font">
      <div className="container px-5 py-5 mx-auto">
     

        {/* <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-teal-900">WE ARE</h1>
          <p className="lg:w-1/2 w-full leading-relaxed text-teal-500">
            Dharaksha Ecosolutions, based in Haryarana fridabad , pioneers biodegradable packaging to combat stubble burning and plastic pollution, driven by a dedicated team of scientists and entrepreneurs shaping a greener future.</p>
        </div> */}
        <AllModuleBarChart/>

        <div className="flex flex-wrap p-4 justify-center">

          <Link to={'/admin/lcPreparation'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
          
                <svg className="w-6 h-6" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" space="preserve">
                  <g>
                    <g>
                      <g>
                        <rect x="195.3" width="99.1" height="35" />
                        <rect x="213.1" y="54.8" width="63.7" height="25.3" />
                        <path d="M308.7,155.4l-27.2-55.6h-73.1l-27.2,55.6c-12.4,26-19,54-19,82.4v234.7c0,9.7,36.9,17.5,82.8,17.5s82.8-7.8,82.8-17.5 V237.4C327.8,209.4,321.2,181.1,308.7,155.4z" />
                      </g>
                    </g>
                  </g>
                </svg>


              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">LC Preparation</h2>
              <p className="leading-relaxed text-base">SC is inoculated into the LC Bottles.</p>
            </div>
          </Link>

          <Link to={'/admin/lcRejection'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
        
              <img className="w-6 h-6" src="./assets/logo/bottleReject.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">LC Rejection</h2>
              <p className="leading-relaxed text-base">LC Bottles is rejected for some reason.</p>
            </div>
          </Link>




          <Link to={'/admin/bagInoculation'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/bag.png" alt="" srcSet="" />

              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Bag Inoculation</h2>
              <p className="leading-relaxed text-base">LC is inoculated into the Parali inside the bag.</p>
            </div>
          </Link>


          <Link to={'/admin/bagStoreRoom'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/bagReject.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Bag Incubation</h2>
              <p className="leading-relaxed text-base">Here, the bag is stored for incubation.</p>
            </div>
          </Link>



          <Link to={'/admin/mouldFilling'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/mould.png" alt="" srcSet="" />  
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Mould Filling</h2>
              <p className="leading-relaxed text-base">Here, the mould is fill with bag's material.</p>
            </div>
          </Link>

          <Link to={'/admin/mouldRejection'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/mouldEffected.png" alt="" srcSet="" />  
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Mould Rejection</h2>
              <p className="leading-relaxed text-base">Moulds are being rejected for some reason.</p>
            </div>
          </Link>

   

          <Link to={'/admin/deMouldingPiece'}>
            <div className="relative border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <span className="absolute top-2 right-2 text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-400 rounded-full px-2 py-0.5">Removed from Process</span>
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/pieceIcon.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">De-Moulding Piece</h2>
              <p className="leading-relaxed text-base">Here, Semi finished goods are remove from moulds.</p>
            </div>
          </Link>


      
          
          <Link to={'/admin/humidifier'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/humidifier.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Humidifier</h2>
              <p className="leading-relaxed text-base">Here, the mould is stored for incubation.</p>
            </div>
          </Link>


          
          <Link to={'/admin/oven'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/oven.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Oven In</h2>
              <p className="leading-relaxed text-base text-wrap">Semi-FG are heat-treated in the oven.</p>
            </div>
          </Link>

          <Link to={'/admin/ovenOut'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/oven.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">Oven Out</h2>
              <p className="leading-relaxed text-base">FG removed from oven after heat treatment.</p>
            </div>
          </Link>

          <Link to={'/admin/qrCodeGen'}>
            <div className="border border-teal-200 p-6 rounded-lg ml-2 mb-2">
              <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
              <img className="w-6 h-6" src="./assets/logo/qr-code-icon.png" alt="" srcSet="" />
              </div>
              <h2 className="text-lg text-teal-900 font-medium title-font mb-2">QR Code Generation</h2>
              <p className="leading-relaxed text-base">Generate QR codes for the production data.</p>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}

export default AdminNavigation;