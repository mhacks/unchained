import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    
`;

const Header = styled.h3`
    display: inline-block;
    -webkit-margin-after: 10px;
    color: ${props => props.color};
    fontSize: 18px;
`;

const Body = styled.p`
    paddingLeft: 20px;
    -webkit-margin-before: 0px;
    color: ${props => props.color};
    fontSize: 15px;
`;

const Slider = styled.div`
    overflow: hidden;
    transformOrigin: top center;
    transition: all 0.3s ease-in-out; 
    
    ${props => props.open ? ` 
        transform: scaleY(1);
    ` : `
        transform: scaleY(0);
    `}
`;

const PlusWrapper = styled.div`
    position: relative;
    display: inline-block;
    paddingRight: 10px;
    height: 15px;
    width: 15px;
`;

const PlusLine = styled.div`
    display: inline-block;
    position: absolute;
    backgroundColor: ${props => props.color};
    height: 10px;
    width: 2px;
    top: 3px;
    transitionDuration: 0.3s;

    ${props => !props.vertical ? `
        transform: rotate(90deg);
    ` : `
        transform: rotate(0deg);
    `}
`;

const Clickable = styled.div`
    cursor: pointer;
`

const Plus = (props) => {
    return (
    <PlusWrapper>
        <PlusLine color={props.color}/>
        <PlusLine color={props.color} vertical={!props.open}/>
    </PlusWrapper>
)};

export default class ExpandingItem extends React.Component {

    constructor(){
        super();
        this.state = { expanded: false };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        this.setState( prevState => ({
            expanded: !prevState.expanded
        }));
    }

    render() {
        return (
            <Wrapper>
                <Clickable onClick={this.handleClick}>
                    <Plus color={this.props.plusColor} open={this.state.expanded} />
                    <Header color={this.props.headerColor}>{this.props.header}</Header>
                </Clickable>
                <Slider open={this.state.expanded}>
                    <Body color={this.props.bodyColor} >{this.props.body}</Body>
                </Slider>
            </Wrapper>
        );
    }

}
