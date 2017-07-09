import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { ProfileThunks, ApplicationThunks } from '../actions';
import {
    PageContainer,
    RoundedButton,
    FileUpload,
    Alert,
    LabeledInput,
    LabeledTextarea
} from '../components';
import {
    FieldTypes,
    ProfileFields,
    HackerApplicationFields
} from '../constants/forms';

import Autocomplete from 'react-autocomplete';

const FormContainer = styled.div`
    maxWidth: 500px;
    margin: 0 auto;
    minHeight: calc(100vh - 30px - 2rem - 80px);
    padding: 20px 0 50px;
`;

const Flexer = styled.div`
    display: flex;
    flexDirection: column;
`;

const InputContainer = styled.div`
    margin: 20px 0 30px 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    flexDirection: row;
    justifyContent: space-between;
`;

const SectionHeader = styled.h2`
    fontSize: 40px;
    color: ${props => props.color};
    fontWeight: 500;
    margin: 0;
`;

const FileUploadContainer = styled.div`
    marginTop: 30px;
`;

const SubsectionHeader = styled.h3`
    fontSize: 22px;
    color: ${props => props.color};
    fontWeight: 500;
    margin: 26px 0 0 0;
`;

const AlertContainer = styled.div`
    marginTop: 30px;
`;

const LegalText = styled.p`
    fontSize: 15px;
    color: gray;
`;

const LegalLink = styled.a`
    color: ${props => props.theme.highlight};
    textDecoration: none;
`;

const Subhead = styled.p`
    margin: 20px 0 0 0;
    color: ${props => props.theme.secondary};
`;

const autocompleteMenuStyle = {
    borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'absolute',
    maxHeight:
        Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        ) /
            2 +
            'px',
    left: '20px',
    top: '45px',
    overflow: 'auto',
    zIndex: 101
};

const autocompleteWrapperStyle = {
    display: 'inherit',
    paddingLeft: '20px',
    width: '100%',
    position: 'relative'
};

class Apply extends React.Component {
    constructor(props) {
        super(props);

        const userData = this.props.userState.data.user;
        const appData = this.props.userState.data.app || {};

        this.state = {
            birthday: userData.birthday
                ? new Date(userData.birthday).toISOString().split('T')[0]
                : '',
            university: userData.university || '',
            major: userData.major || '',
            tshirt: userData.tshirt || 'm',
            hackathonExperience: userData.hackathonExperience || 'novice',
            resume: null,
            isResumeUploaded: userData.isResumeUploaded || false
        };

        for (const key of Object.keys(ProfileFields)) {
            if (
                ProfileFields[key] === FieldTypes.TEXT ||
                ProfileFields[key] === FieldTypes.LINK
            ) {
                this.state[key] = userData[key] || '';
            } else if (ProfileFields[key] === FieldTypes.SELECT) {
                this.state[key] = userData[key] || 'unselected';
            } else if (ProfileFields[key] === FieldTypes.DATE) {
                this.state[key] = userData[key]
                    ? new Date(userData[key]).toISOString().split('T')[0]
                    : '';
            }
        }

        for (const field of HackerApplicationFields) {
            if (!Object.keys(ProfileFields).includes(field.key)) {
                console.log(field, appData[field.key]);
                if (
                    field.type === FieldTypes.TEXT ||
                    field.type === FieldTypes.ESSAY
                ) {
                    this.state[field.key] = appData[field.key] || '';
                } else if (field.type === FieldTypes.SELECT) {
                    this.state[field.key] =
                        appData[field.key] || field.values[0].key;
                } else if (field.type === FieldTypes.INTEGER) {
                    this.state[field.key] = appData[field.key] || 0;
                }
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.handleAttributeChange = this.handleAttributeChange.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleSortItems = this.handleSortItems.bind(this);
        this.handleItemShouldRender = this.handleItemShouldRender.bind(this);
        this.handleRenderMenu = this.handleRenderMenu.bind(this);
        this.defaultHandleRenderMenu = this.defaultHandleRenderMenu.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(ProfileThunks.loadProfile());
    }

    componentWillReceiveProps(nextProps) {
        const userData = this.props.userState.data.user;
        const nextUserData = nextProps.userState.data.user;

        if (nextProps.userState.fetching) {
            return;
        }

        if (
            userData.birthday !== nextUserData ||
            userData.university !== nextUserData.university ||
            userData.major !== nextUserData.major ||
            userData.isResumeUploaded !== nextUserData.isResumeUploaded
        ) {
            this.setState({
                birthday: nextUserData.birthday
                    ? new Date(nextUserData.birthday)
                          .toISOString()
                          .split('T')[0]
                    : '',
                university: nextUserData.university || '',
                major: nextUserData.major || '',
                isResumeUploaded: userData.isResumeUploaded || false
            });
        }
    }

    // Generic function for changing state
    // -- input using this must have a name attribute
    handleAttributeChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleFileUpload(file) {
        this.setState({
            resume: file
        });
    }

    handleSortItems(a, b, value) {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const valueLower = value.toLowerCase();
        const queryPosA = aLower.indexOf(valueLower);
        const queryPosB = bLower.indexOf(valueLower);
        if (queryPosA !== queryPosB) {
            return queryPosA - queryPosB;
        }
        return aLower < bLower ? -1 : 1;
    }

    handleItemShouldRender(current, value) {
        return current.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    handleRenderMenu(items, value, style) {
        return (
            <div
                style={{ ...style, ...autocompleteMenuStyle }}
                children={
                    value.length > 2 ? items : 'Start typing for autocomplete'
                }
            />
        );
    }

    defaultHandleRenderMenu(items, value, style) {
        return (
            <div
                style={{ ...style, ...autocompleteMenuStyle }}
                children={items}
            />
        );
    }

    onSubmit(e) {
        e.preventDefault();

        var application = {};
        var files = {};

        for (const field of HackerApplicationFields) {
            if (
                field.type === FieldTypes.TEXT ||
                field.type === FieldTypes.LINK ||
                field.type === FieldTypes.SELECT ||
                field.type === FieldTypes.INTEGER ||
                field.type === FieldTypes.ESSAY
            ) {
                application[field.key] = this.state[field.key];
            } else if (field.type === FieldTypes.DATE) {
                application[field.key] = new Date(
                    this.state[field.key]
                ).getTime();
            }
        }

        this.props.dispatch(
            ApplicationThunks.uploadApplication(application, files)
        );
    }

    render() {
        return (
            <PageContainer>
                <FormContainer>
                    <SectionHeader color={this.props.theme.primary}>
                        Application
                    </SectionHeader>
                    <form onSubmit={this.onSubmit}>
                        {this.props.userState.error
                            ? <AlertContainer>
                                  <Alert
                                      message={this.props.userState.message}
                                  />
                              </AlertContainer>
                            : null}
                        {this.props.userState.data.isApplicationSubmitted
                            ? <AlertContainer>
                                  <Alert
                                      message={
                                          'Your application is submitted but you can make changes on this page and update your application! Thanks for applying to MHacks X.'
                                      }
                                  />
                              </AlertContainer>
                            : null}
                        <Subhead>
                            Apply for MHacks X! MHacks X will be held on the University of Michigan's North Campus in Ann Arbor from September 22nd to 24th. If you already have teammates in mind, include their names and emails in the "anything else" question.
                        </Subhead>
                        <Flexer>
                            <InputContainer>
                                {HackerApplicationFields.map(field => {
                                    if (
                                        (field.key === 'departing_from' ||
                                            field.key ===
                                                'requested_reimbursement') &&
                                        this.state.needs_reimbursement === 'n'
                                    ) {
                                        return;
                                    }

                                    switch (field.type) {
                                        case FieldTypes.TEXT:
                                        case FieldTypes.LINK:
                                            return (
                                                <LabeledInput
                                                    label={field.label}
                                                    labelWidth={
                                                        field.wideLabel
                                                            ? '150px'
                                                            : '100px'
                                                    }
                                                    key={field.key}
                                                >
                                                    {field.autocomplete
                                                        ? <Autocomplete
                                                              getItemValue={item =>
                                                                  item}
                                                              items={
                                                                  field.autocomplete
                                                              }
                                                              shouldItemRender={
                                                                  this
                                                                      .handleItemShouldRender
                                                              }
                                                              renderItem={(
                                                                  item,
                                                                  isHighlighted
                                                              ) =>
                                                                  <div
                                                                      style={{
                                                                          background: isHighlighted
                                                                              ? 'lightgray'
                                                                              : 'white'
                                                                      }}
                                                                  >
                                                                      {item}
                                                                  </div>}
                                                              inputProps={{
                                                                  placeholder:
                                                                      field.placeholder,
                                                                  name:
                                                                      field.key,
                                                                  id: field.key
                                                              }}
                                                              sortItems={
                                                                  this
                                                                      .handleSortItems
                                                              }
                                                              value={
                                                                  this.state[
                                                                      field.key
                                                                  ]
                                                              }
                                                              onChange={
                                                                  this
                                                                      .handleAttributeChange
                                                              }
                                                              onSelect={e => {
                                                                  var fakeEvent = {
                                                                      target: {
                                                                          name:
                                                                              field.key,
                                                                          value: e
                                                                      }
                                                                  };

                                                                  this.handleAttributeChange(
                                                                      fakeEvent
                                                                  );
                                                              }}
                                                              menuStyle={
                                                                  autocompleteMenuStyle
                                                              }
                                                              wrapperStyle={
                                                                  autocompleteWrapperStyle
                                                              }
                                                              renderMenu={
                                                                  field.key ===
                                                                      'university'
                                                                      ? this
                                                                            .handleRenderMenu
                                                                      : this
                                                                            .defaultHandleRenderMenu
                                                              }
                                                          />
                                                        : <input
                                                              id={field.key}
                                                              type="text"
                                                              name={field.key}
                                                              placeholder={
                                                                  field.placeholder
                                                              }
                                                              value={
                                                                  this.state[
                                                                      field.key
                                                                  ]
                                                              }
                                                              onChange={
                                                                  this
                                                                      .handleAttributeChange
                                                              }
                                                          />}
                                                </LabeledInput>
                                            );
                                        case FieldTypes.ESSAY:
                                            return (
                                                <LabeledTextarea
                                                    label={field.label}
                                                    key={field.key}
                                                >
                                                    <textarea
                                                        id={field.key}
                                                        name={field.key}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        value={
                                                            this.state[
                                                                field.key
                                                            ]
                                                        }
                                                        onChange={
                                                            this
                                                                .handleAttributeChange
                                                        }
                                                    />
                                                </LabeledTextarea>
                                            );
                                        case FieldTypes.DATE:
                                            return (
                                                <LabeledInput
                                                    label={field.label}
                                                    labelWidth={
                                                        field.wideLabel
                                                            ? '150px'
                                                            : '100px'
                                                    }
                                                    key={field.key}
                                                >
                                                    <input
                                                        id={field.key}
                                                        type="date"
                                                        name={field.key}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        value={
                                                            this.state[
                                                                field.key
                                                            ]
                                                        }
                                                        onChange={
                                                            this
                                                                .handleAttributeChange
                                                        }
                                                    />
                                                </LabeledInput>
                                            );
                                        case FieldTypes.INTEGER:
                                            return (
                                                <LabeledInput
                                                    label={field.label}
                                                    labelWidth={
                                                        field.wideLabel
                                                            ? '150px'
                                                            : '100px'
                                                    }
                                                    key={field.key}
                                                >
                                                    <input
                                                        id={field.key}
                                                        type="number"
                                                        name={field.key}
                                                        value={
                                                            this.state[
                                                                field.key
                                                            ]
                                                        }
                                                        onChange={
                                                            this
                                                                .handleAttributeChange
                                                        }
                                                    />
                                                </LabeledInput>
                                            );
                                        case FieldTypes.SELECT:
                                            return (
                                                <LabeledInput
                                                    label={field.label}
                                                    labelWidth={
                                                        field.wideLabel
                                                            ? '150px'
                                                            : '100px'
                                                    }
                                                    key={field.key}
                                                >
                                                    <select
                                                        name={field.key}
                                                        value={
                                                            this.state[
                                                                field.key
                                                            ]
                                                        }
                                                        onChange={
                                                            this
                                                                .handleAttributeChange
                                                        }
                                                    >
                                                        {field.values.map(
                                                            tuple => {
                                                                return (
                                                                    <option
                                                                        value={
                                                                            tuple.key
                                                                        }
                                                                        key={
                                                                            tuple.key
                                                                        }
                                                                    >
                                                                        {tuple.value}
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                </LabeledInput>
                                            );
                                        case FieldTypes.SECTIONHEADER:
                                            return (
                                                <SubsectionHeader
                                                    color={
                                                        this.props.theme.primary
                                                    }
                                                    key={field.title}
                                                >
                                                    {field.title}
                                                </SubsectionHeader>
                                            );
                                    }
                                })}
                                <FileUploadContainer>
                                    <FileUpload
                                        defaultColor={
                                            this.props.userState.data.user
                                                .isResumeUploaded
                                                ? this.props.theme.success
                                                : this.props.theme.primary
                                        }
                                        hoverColor={this.props.theme.secondary}
                                        activeColor={this.props.theme.success}
                                        onFileSelect={this.handleFileUpload}
                                        defaultText={
                                            this.props.userState.data.user
                                                .isResumeUploaded
                                                ? 'Resume Uploaded'
                                                : null
                                        }
                                    />
                                </FileUploadContainer>
                            </InputContainer>
                            <ButtonGroup>
                                <RoundedButton
                                    type="submit"
                                    color={this.props.theme.primary}
                                >
                                    Submit
                                </RoundedButton>
                            </ButtonGroup>
                            <LegalText>
                                By applying to MHacks X, you agree to the
                                MHacks{' '}
                                <LegalLink href="https://docs.google.com/document/d/1L9wC7lfXmOBCKdUQancuoYQf86KIQqUJ0is4dr8QqQM/pub">
                                    Code of Conduct
                                </LegalLink>.
                            </LegalText>
                        </Flexer>
                    </form>
                </FormContainer>
            </PageContainer>
        );
    }
}

Apply.contextTypes = {
    router: React.PropTypes.object
};

function mapStateToProps(state) {
    return {
        userState: state.userState,
        theme: state.theme.data
    };
}

export default connect(mapStateToProps)(Apply);
