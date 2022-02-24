import React from 'react';
import Particles from "react-tsparticles";
import { Main } from "tsparticles";
import { loadTrianglesPreset } from "tsparticles-preset-triangles";

// @ts-ignore
export class ParticlesContainer extends React.PureComponent<IProps> {
    // this customizes the component tsParticles installation
    customInit(main: Main) {
        // this adds the preset to tsParticles, you can safely use the
        loadTrianglesPreset(main);
    }

    render() {
        const options = {
            fullScreen: { enable: true, zIndex: 0},
            background: {
                color: {
                    // value: "#202124",
                    // value: "#F4F9E9",
                    value: "#FAFAFB",
                },
            },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    onHover: {
                        enable: false,
                        mode: "repulse",
                    },
                    resize: true,
                },
                modes: {
                    bubble: {
                        distance: 400,
                        duration: 2,
                        opacity: 0.8,
                        size: 40,
                    },
                    push: {
                        quantity: 4,
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                color: {
                    value: "#f78dff",
                    // value: "#23024D",
                    // value: "#5B2A86",
                },
                links: {
                    color: "#47bfe7",
                    // color: "#23024D",
                    // color: "#5B2A86",
                    distance: 150,
                    enable: true,
                    opacity: 0.5,
                    width: 1,
                },
                collisions: {
                    enable: true,
                },
                move: {
                    direction: "right",
                    enable: true,
                    // outMode: "bounce",
                    random: false,
                    speed: 1,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 1500,
                    },
                    value: 100,
                },
                opacity: {
                    value: 0.60,
                },
                shape: {
                    type: "circle",
                },
                size: {
                    random: true,
                    value: 5,
                },
            },
            detectRetina: true,
        };

        // @ts-ignore
        return <Particles options={options} init={this.customInit} />;
    }
}
