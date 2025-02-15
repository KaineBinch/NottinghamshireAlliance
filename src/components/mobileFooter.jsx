import logo from "../assets/Logo.png"
import Socials from "../components/socials"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"

const MobFoot = () => {
  const contactQuery = queryBuilder(MODELS.contact, QUERIES.contactQuery)
  const {
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
    data: contactData,
    error: errorContacts,
  } = useFetch(contactQuery)

  const socialQuery = queryBuilder(MODELS.social, QUERIES.socialQuery)
  const {
    isLoading: isLoadingSocials,
    isError: isErrorSocials,
    data: socialData,
    error: errorSocials,
  } = useFetch(socialQuery)

  if (isLoadingContacts || isLoadingSocials) {
    return <p className="pt-[85px]">Loading...</p>
  }

  if (isErrorContacts || isErrorSocials) {
    console.error("Error fetching data:", errorContacts || errorSocials)
    return (
      <div className="pt-[85px]">
        <p>Something went wrong...</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <>
      <hr className="border-black mt-10" />
      <div className="bg-[#D9D9D9] text-black px-5">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center py-6 mx-auto max-w-5xl">
          <img className="h-[150px]" src={logo} alt="Logo" />
        </div>

        {/* Contact & Link Section */}
        <div className="flex flex-col md:flex-row justify-center text-center gap-8 pb-6">
          {/* Contact Section */}
          <div className="md:w-1/2 flex flex-col items-center">
            {contactData?.data?.length > 0 ? (
              contactData.data.map((contact, i) => (
                <div key={i} className="text-center py-2">
                  <p className="font-bold text-lg">{contact.name}</p>
                  <p className="text-base py-2">{contact.position}</p>
                  {contact.tel && (
                    <p className="text-base">
                      <a href={`tel:${contact.tel}`}>{contact.tel}</a>
                    </p>
                  )}
                  {contact.email && (
                    <p className="text-base py-2">
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No contact information available.</p>
            )}
          </div>

          {/* Link Section */}
          <div className="md:w-1/2 flex flex-col items-center justify-center font-bold">
            <p className="text-base">
              <a href="/#/admin">Admin</a>
            </p>
            <p className="text-base py-8">
              <a href="/#/club-officers">Club Officers</a>
            </p>
            <p className="text-base">
              <a href="/#/rules">Rules</a>
            </p>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex w-full mx-auto justify-center items-center py-4 gap-4 flex-wrap">
          {socialData?.data?.length > 0 ? (
            socialData.data.map((social, i) => (
              <div key={i} className="inline-flex">
                <Socials
                  icon={social.platformFAIcon}
                  link={social.platformURL}
                />
              </div>
            ))
          ) : (
            <p>No social media links available.</p>
          )}
        </div>

        {/* Footer Copyright */}
        <div className="flex flex-col items-center justify-center pb-3"></div>
      </div>
      <hr className="border-1 border-neutral mt-8" />
      <div className="max-w-5xl mx-auto flex flex-col p-5 leading-6 text-center items-center text-xs">
        <div className="flex flex-row place-content-between">
          <p className="">Copyright © 2024 Nottinghamshire Golf Alliance</p>
        </div>
        <div>
          <a
            href={"https://kainebinch.dev"}
            target="_blank"
            rel="noreferrer"
            className="pt-5 text-xs ">
            Web Design by Kaine Binch
          </a>
        </div>
      </div>
    </>
  )
}

export default MobFoot
