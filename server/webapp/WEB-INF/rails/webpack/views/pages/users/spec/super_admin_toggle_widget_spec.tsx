/*
 * Copyright 2019 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as m from "mithril";

import * as stream from "mithril/stream";
import {Stream} from "mithril/stream";

import {User, Users} from "models/users/users";
import "views/components/table/spec/table_matchers";
import {SuperAdminPrivilegeSwitch} from "views/pages/users/super_admin_toggle_widget";

describe("Super Admin Toggle", () => {
  const simulateEvent = require("simulate-event");

  let $root: any, root: any;

  let user: User,
      noAdminsConfigured: Stream<boolean>,
      onRemoveAdmin: (users: Users, e: MouseEvent) => void,
      onMakeAdmin: (users: Users, e: MouseEvent) => void;

  beforeEach(() => {
    user               = bob();
    onMakeAdmin        = jasmine.createSpy("onMakeAdmin");
    onRemoveAdmin      = jasmine.createSpy("onRemoveAdmin");
    noAdminsConfigured = stream(false);

    // @ts-ignore
    [$root, root] = window.createDomElementForTest();
  });

  beforeEach(mount);

  afterEach(unmount);

  // @ts-ignore
  afterEach(window.destroyDomElementForTest);

  it("should render YES when the user is an admin", () => {
    expect(find("is-admin-text")).toContainText("YES");
  });

  it("should render NO when the user is an admin", () => {
    user.isAdmin(false);
    m.redraw();

    expect(find("is-admin-text")).toContainText("NO");
  });

  it("should render Not Specified when system administrators are not configured", () => {
    noAdminsConfigured(true);
    m.redraw();

    expect(find("is-admin-text")).toContainText("Not Specified");
  });

  it("should render enabled toggle button when the user is an admin", () => {
    expect(find("switch-checkbox").get(0).checked).toBe(true);
  });

  it("should render disabled toggle button when the user is NOT an admin", () => {
    user.isAdmin(false);
    m.redraw();

    expect(find("switch-checkbox").get(0).checked).toBe(false);
  });

  it("should render disabled toggle system administrators are not configured", () => {
    noAdminsConfigured(true);
    m.redraw();

    expect(find("switch-checkbox").get(0).checked).toBe(false);
  });

  it("should render make current user admin tooltip when system administrators are not configured", () => {
    noAdminsConfigured(true);
    m.redraw();

    const expectedTooltipContent = "Explicitly making 'bob' user a system administrator will result into other users not having system administrator privileges.";

    expect(find("tooltip-wrapper")).toBeInDOM();
    expect(find("tooltip-content")).toContainText(expectedTooltipContent);
  });

  it("should NOT render make current user admin tooltip when system administrators are configured", () => {
    expect(find("tooltip-wrapper")).not.toBeInDOM();
  });

  it("should make a request to revoke admin on toggling admin user privilege", () => {
    expect(onRemoveAdmin).not.toHaveBeenCalled();
    simulateEvent.simulate(find("switch-paddle").get(0), "click");
    expect(onRemoveAdmin).toHaveBeenCalled();
  });

  it("should make a request to make admin on toggling non admin user privilege", () => {
    user.isAdmin(false);
    m.redraw();

    expect(onMakeAdmin).not.toHaveBeenCalled();
    simulateEvent.simulate(find("switch-paddle").get(0), "click");
    expect(onMakeAdmin).toHaveBeenCalled();
  });

  function mount() {
    m.mount(root, {
      view() {
        return (
          <SuperAdminPrivilegeSwitch user={user}
                                     noAdminsConfigured={noAdminsConfigured}
                                     onRemoveAdmin={onRemoveAdmin}
                                     onMakeAdmin={onMakeAdmin}/>
        );
      }
    });

    m.redraw();
  }

  function unmount() {
    m.mount(root, null);
    m.redraw();
  }

  function find(id: string) {
    return $root.find(`[data-test-id='${id}']`);
  }

  function bob() {
    return User.fromJSON({
                           email: "bob@example.com",
                           display_name: "Bob",
                           login_name: "bob",
                           is_admin: true,
                           email_me: true,
                           checkin_aliases: ["bob@gmail.com"],
                           enabled: true
                         });
  }
});
