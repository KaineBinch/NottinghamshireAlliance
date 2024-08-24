const Contacts = ({ name, position, tel, email }) => {
  return (
    <>
      <div className="flex flex-col items-start justify-center my-12">
        <h1 className="mb-1">{name}</h1>
        <div className="my-1 text-lg">{position}</div>
        <a className="my-1 text-lg" href={`tel:${tel}`}>
          {tel}
        </a>
        <a className="my-1 text-lg" href={`mailto:${email}`}>
          {email}
        </a>
      </div>
    </>
  );
};
export default Contacts;
