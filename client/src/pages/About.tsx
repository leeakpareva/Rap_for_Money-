import { Link } from 'react-router-dom'

const About = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="py-6">
      <div className="card p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="text-4xl font-bold text-purple">R4M</Link>
            <h1 className="text-3xl font-bold text-white mt-4 mb-2">About R4M – Rap For Money</h1>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              R4M (Rap For Money) is a community platform built for rappers, producers, engineers and fans
              who live and breathe hip-hop culture. It's a place to share freestyles, studio moments, beat ideas and
              performance clips, connect with collaborators, and build a real audience around your sound.
            </p>

            <p>
              R4M is creatively anchored by Nigerian record producer Olagundoye James Malcolm, professionally known
              as Chopstix. Born in Jos, Plateau State, Chopstix is a Grammy Award–winning and multi-platinum-certified
              producer whose work spans Afrofusion, Afrobeats, Afropop, hip-hop and dancehall. He first came to wider
              attention as part of the Grip Movement (later known as Grip Boiz) alongside artists such as Yung L,
              Endia and J Milla, helping to shape a new phase of African hip-hop and dancehall.
            </p>

            <p>
              As the lead producer around Ice Prince's 'Fire of Zamani' era, Chopstix crafted influential records
              including 'Aboki', 'Gimme Dat', 'I Swear' and 'More'. He has since gone on to co-produce global hits
              such as Burna Boy's 'Last Last' and contribute to major projects like African Giant, Love, Damini and
              Chris Brown's 11:11, earning recognition from The Recording Academy and BMI for his songwriting and
              production work.
            </p>

            <p>
              R4M – Rap For Money is designed and built by Lee Akpareva, blending a love for hip-hop with
              full-stack engineering and AI-driven product thinking. The mission is simple: give rap artists,
              from underground to global, a focused space to own their narrative, showcase their catalogue and
              connect with the collaborators and fans who really get it.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <div className="card p-6 border-purple border">
              <h2 className="text-xl font-bold text-white mb-4">Platform Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">Content Sharing</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Upload videos and images</li>
                    <li>• Share freestyles and beats</li>
                    <li>• Studio moments and performances</li>
                    <li>• Like and comment on posts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Community</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Follow your favorite artists</li>
                    <li>• Discover new talent</li>
                    <li>• Build your fanbase</li>
                    <li>• Connect with collaborators</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Live Streaming</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Go live for up to 4 minutes</li>
                    <li>• Share real-time performances</li>
                    <li>• Connect with fans instantly</li>
                    <li>• Showcase your skills</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Hip-Hop Focused</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Built for rap culture</li>
                    <li>• Support all hip-hop genres</li>
                    <li>• From underground to mainstream</li>
                    <li>• Authentic community</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-purple-900 to-purple-800">
              <h2 className="text-xl font-bold text-white mb-4">Join the Movement</h2>
              <p className="text-gray-200 mb-6">
                Whether you're a rapper, producer, engineer, or just love hip-hop culture,
                R4M is your space to connect, create, and collaborate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register" className="btn-primary text-center">
                  Create Account
                </Link>
                <Link to="/auth/login" className="btn-secondary text-center">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <footer className="text-center mt-12 pt-8 border-t border-dark-border">
            <p className="text-gray-400">
              R4M © {currentYear}. Rap For Money. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default About