
function RightSidebar() {
  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>
        </div>
        
          <div className='flex flex-1 flex-col justify-start'>
            <h3 className='text-heading4-medium text-light-1'>
              Suggested Users
            </h3>
            <p className='!text-base-regular text-light-3'>
              No users yet
            </p>
          </div>
      </section> 
  );
}

export default RightSidebar;