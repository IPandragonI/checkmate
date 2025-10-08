import Image from 'next/image'

const Svg = (props: React.ComponentProps<typeof Image>) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...props} unoptimized />
}

export default Svg;