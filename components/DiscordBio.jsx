const {
  React,
  getModule,
  i18n: { Messages },
  getModuleByDisplayName
} = require('powercord/webpack');
const { Spinner, Text, Flex } = require('powercord/components');
const AsyncComponent = require('powercord/components/AsyncComponent');

const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));
const Anchor = AsyncComponent.from(getModuleByDisplayName('Anchor'));

const { AdvancedScrollerThin } = getModule([ 'AdvancedScrollerThin' ], false);

const Genders = [ 'Male', 'Female', 'Nonbinary', 'Undisclosed' ];

class Section extends React.PureComponent {
  constructor (props) {
    super(props);

    this.classes = {
      ...getModule([ 'marginBottom8' ], false)
    };
  }

  render () {
    const { children, title } = this.props;

    if (!children) {
      return null;
    }

    return (
      <FormSection
        className={`${this.classes.marginBottom8} bot-section`}
        tag='h5'
        title={title}
      >
        <Text selectable={true}>{children}</Text>
      </FormSection>
    );
  }
}

module.exports = class DiscordBot extends React.PureComponent {
  constructor (props) {
    super(props);

    this.classes = {
      empty: getModule([ 'body', 'empty' ], false).empty,
      nelly: getModule([ 'flexWrapper', 'image' ], false).image,
      ...getModule([ 'emptyIcon' ], false)
    };

    this.state = {
      streamerMode: getModule([ 'hidePersonalInformation' ], false)
        .hidePersonalInformation
    };
  }

  async componentDidMount () {
    const { fetchBot, id } = this.props;

    try {
      const bot = await fetchBot(id);
      this.setState({ bot });
    } catch (e) {
      switch (e.statusCode) {
        case 404: {
          this.setState({
            error: {
              message:
                'Looks like this person doesn\'t have a top.gg profile',
              icon: this.classes.emptyIconFriends
            }
          });
          break;
        }
        case 429: {
          this.setState({
            error: {
              message:
                'Woah there buddy! You hit the rate limit. Maybe… try slowing down?'
            }
          });
          break;
        }
        default: {
          this.setState({
            error: {
              message: 'An unknown error occurred. Maybe try again later?'
            }
          });
          break;
        }
      }
    }
  }

  render () {
    const moment = getModule([ 'momentProperties' ], false);
    const { bot, error, streamerMode } = this.state;
    const { getSetting } = this.props;

    if (streamerMode) {
      return (
        <div className={this.classes.empty}>
          <div className={this.classes.emptyIconStreamerMode} />
          <div className={this.classes.emptyText}>
            {Messages.STREAMER_MODE_ENABLED}
          </div>
        </div>
      );
    } else if (error) {
      const { message, icon } = error;

      return (
        <div className={this.classes.empty}>
          <div className={`${icon || this.classes.nelly} error-icon`} />
          <div className={this.classes.emptyText}>{message}</div>
        </div>
      );
    } else if (!bot) {
      return (
        <div className={this.classes.empty}>
          <Spinner />
        </div>
      );
    }
    const {
      description,
      gender,
      location,
      email,
      occupation,
      birthday,
      created_at
    } = bot.user.details;

    return (
      <AdvancedScrollerThin className='discord-bot' fade={true}>
        <Flex justify={Flex.Justify.START} wrap={Flex.Wrap.WRAP}>
          <Section title='Description'>{description}</Section>
          <Section title='Gender'>{Genders[gender]}</Section>
          <Section title='Location'>{location}</Section>
          <Section title='Occupation'>{occupation}</Section>
          {birthday && (
            <Section title='Birthday'>
              {moment(birthday)
                .startOf('day')
                .format(getSetting('date-format', 'DD.MM.YYYY'))
              /* I know this is quick and dirty but you can't stop me MUAHAHAHA */
                .replace(' 12:00 AM', '')}
            </Section>
          )}
          <Section title='Created At'>
            {moment(created_at)
              .startOf('day')
              .format(getSetting('date-format', 'DD.MM.YYYY'))
            /* I know this is quick and dirty but you can't stop me MUAHAHAHA */
              .replace(' 12:00 AM', '')}
          </Section>
          {email && (
            <Section title='E-Mail'>
              <Anchor href={`mailto:${email}`}>{email}</Anchor>
            </Section>
          )}
        </Flex>
      </AdvancedScrollerThin>
    );
  }
};
