import Image from "next/image";
import Link from "next/link";
import logo from "@/public/white.svg";

export default function Footer() {
  return (
    <footer className="text-neonblue bg-black py-10 font-light text-white">
      <nav className="container mx-auto flex flex-col items-center px-6 md:px-9 lg:px-16 xl:px-20">
        <div className="grid w-full grid-cols-1 gap-y-10 lg:grid-cols-3">
          <div className="mt-1">
            <Link href="/">
              <Image
                src={logo}
                alt="Tableland"
                className="h-3 w-auto"
                priority={true}
              />
            </Link>

            <div className="mt-3">
              <Link href="https://github.com/tablelandnetwork" target="_blank">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 496 512"
                  className="mr-4 inline-block text-lg text-gray-400 hover:text-white"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                </svg>
              </Link>
              <Link href="https://twitter.com/tableland" target="_blank">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  className="mr-4 inline-block text-lg text-gray-400 hover:text-white"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                </svg>
              </Link>
              <Link
                href="https://www.youtube.com/@tablelandxyz"
                target="_blank"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 576 512"
                  className="mr-4 inline-block text-lg text-gray-400 hover:text-white"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                </svg>
              </Link>
              <Link href="https://tableland.xyz/discord" target="_blank">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 640 512"
                  className="mr-4 inline-block text-lg text-gray-400 hover:text-white"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                </svg>
              </Link>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-10 md:col-span-2 md:grid-cols-5">
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-medium text-white">Product</h3>
              <ul className="flex flex-col space-y-3">
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/use-cases/#application-data"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Application Data
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/use-cases/#nfts--gaming"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    NFTs &amp; Gaming
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/use-cases/#data-daos--token-gating"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Data DAOs &amp; Token Gating
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-medium text-white">Resources</h3>
              <ul className="flex flex-col space-y-3">
                <li className="text-xs">
                  <Link
                    href="https://mirror.xyz/tableland.eth"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://dev.tableland.xyz"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Tech Blog
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    target="_self"
                    className="text-gray-300 hover:text-white"
                    href="https://tableland.xyz/pilot-program"
                  >
                    Pilot Program
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://tableland.xyz/jobs"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Jobs
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://tableland.xyz/newsletter"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Newsletter
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/about/general-faqs"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-medium text-white">Developers</h3>
              <ul className="flex flex-col space-y-3">
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/quickstarts"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Quickstarts
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/specs/sql"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    SQL Spec
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/sdk"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    SDK
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/cli"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    CLI
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/tutorials"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Tutorials
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/quickstarts/local-tableland"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Local Tableland
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-medium text-white">Rigs</h3>
              <ul className="flex flex-col space-y-3">
                <li className="text-xs">
                  <Link
                    target="_self"
                    className="text-gray-300 hover:text-white"
                    href="https://tableland.xyz/rigs"
                  >
                    Info
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://garage.tableland.xyz"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Garage
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    target="_self"
                    className="text-gray-300 hover:text-white"
                    href="https://tableland.xyz/rigs/samples"
                  >
                    Samples
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://opensea.io/collection/tableland-rigs"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    OpenSea
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-medium text-white">Network</h3>
              <ul className="flex flex-col space-y-3">
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/architecture/protocol-design"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Protocol
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/fundamentals/about/roadmap"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Roadmap
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/validator"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Run a Node
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://docs.tableland.xyz/gateway-api"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Gateway
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://tableland.xyz/token"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Token Info
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://textile.notion.site/Tableland-Privacy-Policy-6fd160e7f485491d9dc4cbab188043d5"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Privacy
                  </Link>
                </li>
                <li className="text-xs">
                  <Link
                    href="https://textile.notion.site/Tableland-Terms-of-Use-cf80f1b550b843ad9d4b8c3140b78e35"
                    target="_blank"
                    className="text-gray-300 hover:text-white"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <div className="footer-bottom"></div>
    </footer>
  );
}
