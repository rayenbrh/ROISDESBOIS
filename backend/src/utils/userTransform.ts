
/**
 * Transform user object from DB format to API format
 * Converts name.first/name.last to firstName/lastName for frontend compatibility
 */
export const transformUser = (user: any): any => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;
  
  return {
    _id: userObj._id,
    firstName: userObj.name?.first || '',
    lastName: userObj.name?.last || '',
    email: userObj.email,
    role: userObj.role,
    assignedCommercial: userObj.assignedCommercial,
    storeId: userObj.storeId,
    isActive: userObj.isActive,
    lastLogin: userObj.lastLogin,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };
};

/**
 * Transform array of users
 */
export const transformUsers = (users: any[]): any[] => {
  return users.map(transformUser);
};