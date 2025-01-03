const Contacts = ({ name, position, tel, email }) => {
  return (
    <>
      <div className="flex flex-col items-start justify-center my-12">
        <h2 className="mb-1">{name}</h2>
        {position && <a className="my-1 text-lg">{position}</a>}
        {tel && (
          <a className="my-1 text-lg" href={`tel:${tel}`}>
            {tel}
          </a>
        )}
        {email && (
          <a className="my-1 text-lg" href={`mailto:${email}`}>
            {email}
          </a>
        )}
      </div>
    </>
  );
};
export default Contacts;
