import { Button, Card, CardHeader, CardBody, CardFooter, Input, Badge, Tag, Divider, Avatar, Skeleton } from '@/components/ui'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Design System Demo</h1>

        {/* Buttons */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Delete</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button variant="ghost" size="icon">
              🎨
            </Button>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Card Title</h3>
              </CardHeader>
              <CardBody>
                <p className="text-text-secondary">Card content goes here.</p>
              </CardBody>
              <CardFooter>
                <Button variant="primary">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
          <div className="max-w-md">
            <Input type="text" placeholder="Enter text..." className="mb-4" />
            <Input type="email" placeholder="Enter email..." />
          </div>
        </section>

        {/* Badges and Tags */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Badges and Tags</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Tag variant="default">Tag Default</Tag>
            <Tag variant="outline">Tag Outline</Tag>
          </div>
        </section>

        {/* Avatar */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Avatar</h2>
          <div className="flex items-center gap-4">
            <Avatar src="https://i.pravatar.cc/150?u=1" alt="User" size="sm" />
            <Avatar src="https://i.pravatar.cc/150?u=2" alt="User" size="md" />
            <Avatar src="https://i.pravatar.cc/150?u=3" alt="User" size="lg" />
            <Avatar alt="No Image" size="xl" />
          </div>
        </section>

        {/* Skeleton */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Skeleton</h2>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-full" />
            <Skeleton variant="rect" className="h-32 w-full" />
            <Skeleton variant="circle" className="h-12 w-12" />
          </div>
        </section>
      </div>
    </div>
  )
}
