const orderData = [
  {
    id: "created",
    title: "Order Made",
    subtitle: "Create order",
    timestamp: "2023-10-24 09:30 AM",
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
    details: {
      title: "Order Created Successfully",
      subtitle: "System generated invoice #INV-2023-8892",
      content: `
                <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div class="flex justify-between mb-4">
                        <span class="text-gray-500">Order Type</span>
                        <span class="font-medium">Standard Delivery</span>
                    </div>
                    <div class="flex justify-between mb-4">
                        <span class="text-gray-500">Items Count</span>
                        <span class="font-medium">3 Items</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Initial Weight</span>
                        <span class="font-medium">2.4 kg</span>
                    </div>
                </div>
                <div class="mt-6">
                    <h5 class="font-semibold mb-2">Notes</h5>
                    <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-100">"Please handle with care. Contains fragile electronics."</p>
                </div>
            `,
      visual: `
                <div class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6 text-center">
                    <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">Digital Invoice Generated</h4>
                    <p class="text-sm text-gray-500 mt-2">Order #TX12XX34XX has been logged into the system.</p>
                </div>
            `,
    },
  },
  {
    id: "paid",
    title: "Order Paid",
    subtitle: "Customer Payment",
    timestamp: "2023-10-24 10:15 AM",
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>',
    details: {
      title: "Payment Confirmed",
      subtitle: "Visa ending in 4242 • $125.00 USD",
      content: `
                <div class="space-y-4">
                    <div class="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                        <div class="bg-green-500 text-white p-2 rounded-full">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <div class="font-bold text-green-800">Transaction Approved</div>
                            <div class="text-sm text-green-600">Auth Code: 883920</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-white border rounded-lg">
                            <div class="text-xs text-gray-400 uppercase">Subtotal</div>
                            <div class="font-semibold">$115.00</div>
                        </div>
                        <div class="p-4 bg-white border rounded-lg">
                            <div class="text-xs text-gray-400 uppercase">Shipping</div>
                            <div class="font-semibold">$10.00</div>
                        </div>
                    </div>
                </div>
            `,
      visual: `
                 <div class="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    <div class="w-24 h-16 bg-white border-2 border-gray-200 rounded shadow-md flex flex-col items-center justify-center relative z-10 mb-4">
                        <div class="w-full h-4 bg-gray-100 border-b border-gray-200"></div>
                        <span class="text-xs font-bold text-gray-400 mt-2">VISA</span>
                    </div>
                    <div class="text-2xl font-bold text-green-700">$125.00</div>
                    <div class="text-sm text-green-600 mt-1">Paid on Oct 24</div>
                    
                    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
                    <div class="absolute top-10 -left-10 w-20 h-20 bg-green-300 rounded-full opacity-20"></div>
                </div>
            `,
    },
  },
  {
    id: "shipped",
    title: "Shipped",
    subtitle: "On delivery",
    timestamp: "2023-10-25 08:45 AM",
    active: true,
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>',
    details: {
      title: "Out for Delivery",
      subtitle: "Courier: FastTrack Logistics",
      content: `
                <div class="space-y-4">
                    <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-gray-700">Tracking Number</span>
                            <span class="text-[#5E9D4B] font-mono font-bold">FTL-99887766</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div class="bg-[#5E9D4B] h-2.5 rounded-full" style="width: 65%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>Warehouse</span>
                            <span>Destination</span>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <h5 class="font-semibold text-gray-800">Recent Activity</h5>
                        <div class="flex gap-3 text-sm">
                            <div class="flex flex-col items-center">
                                <div class="w-2 h-2 bg-[#5E9D4B] rounded-full"></div>
                                <div class="w-0.5 h-full bg-gray-200 my-1"></div>
                            </div>
                            <div>
                                <div class="font-medium">Arrived at Regional Hub</div>
                                <div class="text-gray-500 text-xs">Oct 25, 09:30 AM • Singapore Central</div>
                            </div>
                        </div>
                        <div class="flex gap-3 text-sm">
                            <div class="flex flex-col items-center">
                                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                            <div>
                                <div class="font-medium text-gray-600">Picked up by courier</div>
                                <div class="text-gray-400 text-xs">Oct 25, 08:45 AM</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
      visual: `
                <div class="w-full h-full bg-gray-100 relative overflow-hidden group">
                    <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;"></div>
                    
                    <svg class="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 50 150 Q 150 50 300 100 T 550 150" fill="none" stroke="#5E9D4B" stroke-width="3" stroke-dasharray="5,5" />
                        <circle cx="50" cy="150" r="6" fill="#94a3b8" />
                        <circle cx="550" cy="150" r="6" fill="#5E9D4B" />
                    </svg>

                    <div class="absolute top-[80px] left-[300px] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 animate-bounce">
                        <div class="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                            <svg class="w-8 h-8 text-[#5E9D4B]" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
                        </div>
                        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            On the way
                        </div>
                    </div>
                </div>
            `,
    },
  },
  {
    id: "completed",
    title: "Completed",
    subtitle: "Order Completed",
    timestamp: "Pending",
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    details: {
      title: "Delivery Pending",
      subtitle: "Awaiting final confirmation",
      content: `
                <div class="text-center py-8">
                    <div class="inline-block p-4 rounded-full bg-gray-100 mb-4">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h4 class="text-lg font-medium text-gray-900">Estimated Arrival</h4>
                    <p class="text-3xl font-bold text-gray-800 mt-2">Oct 26, 2023</p>
                    <p class="text-sm text-gray-500 mt-1">Between 2:00 PM - 4:00 PM</p>
                    
                    <div class="mt-8 border-t pt-6">
                        <button class="text-[#5E9D4B] font-medium hover:underline">View Delivery Instructions</button>
                    </div>
                </div>
            `,
      visual: `
                <div class="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                    <div class="w-full max-w-xs bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div class="h-2 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-2 w-full bg-gray-100 rounded"></div>
                            <div class="h-2 w-5/6 bg-gray-100 rounded"></div>
                        </div>
                        <div class="mt-6 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span class="text-xs text-gray-400">SIGNATURE REQUIRED</span>
                            <svg class="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </div>
                    </div>
                    <p class="mt-4 text-sm text-gray-400">Digital POD will be available here</p>
                </div>
            `,
    },
  },
];

const stepsContainer = document.getElementById("steps-container");
const detailTitle = document.getElementById("detail-title");
const detailSubtitle = document.getElementById("detail-subtitle");
const detailTimestamp = document.getElementById("detail-timestamp");
const detailContentLeft = document.getElementById("detail-content-left");
const detailVisualContainer = document.getElementById(
  "detail-visual-container",
);

let currentStepIndex = 2;

function renderSteps() {
  stepsContainer.innerHTML = "";
  orderData.forEach((step, index) => {
    const isActive = index === currentStepIndex;

    const btn = document.createElement("button");
    btn.className = `step-card w-full h-[100px] border rounded-lg flex flex-col items-center justify-center text-center p-2 relative outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E9D4B] ${
      isActive
        ? "active border-[#284B1E]"
        : "bg-white border-[#6F6F6F] hover:border-[#5E9D4B]"
    }`;

    btn.innerHTML = `
            <div class="mb-2 ${isActive ? "text-white" : "text-gray-400"}">
                ${step.icon}
            </div>
            <div class="step-title text-sm font-bold ${isActive ? "text-white" : "text-black"}">${step.title}</div>
            <div class="step-subtitle text-xs ${isActive ? "text-white/80" : "text-gray-500"}">${step.subtitle}</div>
            
            ${isActive ? '<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#5E9D4B]"></div>' : ""}
        `;

    btn.onclick = () => {
      currentStepIndex = index;
      renderSteps();
      updateDetailView(step);
    };

    stepsContainer.appendChild(btn);
  });
}

function updateDetailView(data) {
  detailContentLeft.style.opacity = "0";
  detailVisualContainer.style.opacity = "0";
  detailVisualContainer.style.transform = "scale(0.95)";

  setTimeout(() => {
    detailTitle.textContent = data.details.title;
    detailSubtitle.textContent = data.details.subtitle;
    detailTimestamp.textContent = data.timestamp;
    detailContentLeft.innerHTML = data.details.content;
    detailVisualContainer.innerHTML = data.details.visual;

    detailContentLeft.style.opacity = "1";
    detailContentLeft.style.transition = "opacity 0.3s ease";

    detailVisualContainer.style.opacity = "1";
    detailVisualContainer.style.transform = "scale(1)";
    detailVisualContainer.style.transition =
      "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
  renderSteps();
  updateDetailView(orderData[currentStepIndex]);
});
