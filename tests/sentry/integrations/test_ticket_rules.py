from __future__ import absolute_import

from django.core.urlresolvers import reverse
from rest_framework.test import APITestCase as BaseAPITestCase

from sentry.integrations.jira import JiraCreateTicketAction
from sentry.models.integration import Integration
from sentry.models.rule import Rule
from sentry.rules import EventState
from sentry.testutils import TestCase
from sentry.utils.compat import mock

from tests.fixtures.integrations.jira.mocks.jira import MockJira


class JiraTicketRulesTestCase(TestCase, BaseAPITestCase):
    mock_jira = None

    def get_client(self):
        if not self.mock_jira:
            self.mock_jira = MockJira()
        return self.mock_jira

    def setUp(self):
        super(JiraTicketRulesTestCase, self).setUp()
        self.project_name = "Jira Cloud"
        self.integration = Integration.objects.create(
            provider="jira",
            name=self.project_name,
            metadata={
                "oauth_client_id": "oauth-client-id",
                "shared_secret": "a-super-secret-key-from-atlassian",
                "base_url": "https://example.atlassian.net",
                "domain_name": "example.atlassian.net",
            },
        )
        self.integration.add_organization(self.organization, self.user)
        self.installation = self.integration.get_installation(self.organization.id)

        self.login_as(user=self.user)

    def test_ticket_rules(self):
        with mock.patch.object(self.installation, "get_client", self.get_client):
            # Simulate setting dynamic fields
            self.get_client().set_createmeta(
                self.project_name,
                {
                    # TODO CREATE_META
                },
            )

            # Create a new Rule
            response = self.client.post(
                reverse(
                    "sentry-api-0-project-rules",
                    kwargs={
                        "organization_slug": self.organization.slug,
                        "project_slug": self.project.slug,
                    },
                ),
                format="json",
                data={
                    "name": "hello world",
                    "environment": None,
                    "actionMatch": "any",
                    "frequency": 5,
                    "actions": [
                        {
                            "id": "sentry.integrations.jira.notify_action.JiraCreateTicketAction",
                            "name": "Create a Jira ticket in the Jira Cloud account",
                        }
                    ],
                    "conditions": [],
                },
            )
            assert response.status_code == 200

            # Get the rule from DB
            rule_id = response.data["id"]
            rule_object = Rule.objects.get(id=rule_id)
            rule = JiraCreateTicketAction(self.project, data=response.data, rule=rule_object)

            # Trigger it's `after`
            results = list(rule.after(event=self.event, state=EventState(True, True, True, True)))
            assert len(results) == 1

            # assert tickets created in DB
            # assert ticket created on jira
            id = ""
            self.get_client().get_issue(id)

            results = list(rule.after(event=self.event, state=EventState(True, True, True, True)))
            assert len(results) == 1

            # assert ticket NOT created in DB
            # assert ticket NOT created on jira
