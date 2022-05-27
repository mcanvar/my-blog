// import Head from "next/head"
import { NextPage } from 'next'
import Card from '../components/Card'

const Home: NextPage = () => {
  return (
    <div className="flex flex-col h-full content-start gap-2">
      <h1 className="h-2/12 text-3xl font-bold mt-2 place-self-center">
        Selam 👋
      </h1>
      <div className="h-10/12 grid gap-4 p-4">
        <Card
          title="I received a job offer mid-course, and the subjects I learned were
        current, if not more so, in the company I joined. I honestly feel I got
        every penny’s worth."
          order={1}
          imgSrc={
            'https://images.pexels.com/photos/3775534/pexels-photo-3775534.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }
          date={'12 days ago'}
          colSpan={2}
        >
          <p>
            “ I was an EMT for many years before I joined the bootcamp. I’ve
            been looking to make a transition and have heard some people who had
            an amazing experience here. I signed up for the free intro course
            and found it incredibly fun! I enrolled shortly thereafter. The next
            12 weeks was the best - and most grueling - time of my life. Since
            completing the course, I’ve successfully switched careers, working
            as a Software Engineer at a VR startup. ”
          </p>
        </Card>

        <Card
          title="The team was very supportive and kept me motivated"
          order={2}
          imgSrc={
            'https://images.pexels.com/photos/634021/pexels-photo-634021.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }
          date={'12 days ago'}
          bgClass="bg-gray-900"
        >
          <p>
            “ I started as a total newbie with virtually no coding skills. I now
            work as a mobile engineer for a big company. This was one of the
            best investments I’ve made in myself. ”
          </p>
        </Card>

        <Card
          title="An overall wonderful and rewarding experience"
          order={3}
          imgSrc={
            'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }
          date={'2 days ago'}
          bgClass="bg-white"
          textClass="text-black"
          rowSpan={2}
        >
          <p>
            “ Thank you for the wonderful experience! I now have a job I really
            enjoy, and make a good living while doing something I love. ”
          </p>
        </Card>

        <Card
          title="Awesome teaching support from TAs who did the bootcamp themselves.
              Getting guidance from them and learning from their experiences was
              easy."
          order={4}
          imgSrc={
            'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }
          date={'3 days ago'}
          bgClass="bg-purple-800"
          textClass="text-white"
          rowSpan={2}
          colSpan={2}
        >
          <p>
            “ The staff seem genuinely concerned about my progress which I find
            really refreshing. The program gave me the confidence necessary to
            be able to go out in the world and present myself as a capable
            junior developer. The standard is above the rest. You will get the
            personal attention you need from an incredible community of lgart
            and amazing people. ”
          </p>
        </Card>

        <Card
          title="Such a life-changing experience. Highly recommended!"
          order={2}
          imgSrc={
            'https://images.pexels.com/photos/3762804/pexels-photo-3762804.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }
          date={'3 days ago'}
          bgClass="bg-white"
          textClass="text-black"
          rowSpan={4}
        >
          <p>
            “ Before joining the bootcamp, I’ve never written a line of code. I
            needed some structure from professionals who can help me learn
            programming step by step. I was encouraged to enroll by a former
            student of theirs who can only say wonderful things about the
            program. The entire curriculum and staff did not disappoint. They
            were very hands-on and I never had to wait long for assistance. The
            agile team project, in particular, was outstanding. It certainly
            helped me land a job as a full-stack developer after receiving
            multiple offers. 100% recommend! ”
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Home
