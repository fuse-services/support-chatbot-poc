  
// Define type precedence
const typePrecedence = {
    'Issue Detail': 1,
    'Steps': 2,
    'Expected Result': 3,
    'Actual Result': 4,
};
  
// Function to select unique items based on ticketNo and type precedence
const selectUniqueItems = (data) => {
    const uniqueMap = new Map();
  
    data.forEach(item => {
      const existingItem = uniqueMap.get(item.ticketNo);
      if (!existingItem || typePrecedence[item.type] < typePrecedence[existingItem.type]) {
        uniqueMap.set(item.ticketNo, item);
      }
    });
  
    return Array.from(uniqueMap.values());
  }
  
module.exports = { selectUniqueItems }
  